import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document';
import { Company, Document } from '../../models/document';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormField, MatInput, MatLabel,
    MatButton, MatCard, MatCardTitle, MatCardContent,
    MatSelect, MatOption, MatProgressSpinner
  ],
  templateUrl: './document-form.html',
  styleUrls: ['./document-form.scss']
})
export class DocumentFormComponent implements OnInit {
  // Signals
  loading = signal(false);
  isEditMode = signal(false);
  companies = signal<Company[]>([]);

  // Form and state
  documentForm: FormGroup;
  documentId: number | null = null;

  // Constants
  private readonly FORM_ERRORS = {
    REQUIRED: 'Campo obrigatório',
    EMAIL: 'Email inválido',
    MIN_LENGTH: 'Mínimo de 3 caracteres',
    PDF_PATTERN: 'URL deve apontar para um arquivo PDF',
    PAST_DATE: 'Data não pode ser no passado'
  };

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.documentForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  // Public methods
  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  submit(): void {
    if (!this.isFormValid()) {
      this.handleInvalidForm();
      return;
    }

    this.processFormSubmission();
  }

  cancel(): void {
    this.navigateToDocumentList();
  }

  // Private methods
  private initializeComponent(): void {
    this.loadCompanies();
    this.handleRouteParams();
  }

  private handleRouteParams(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.setupEditMode(+params['id']);
      }
    });
  }

  private setupEditMode(id: number): void {
    this.documentId = id;
    this.isEditMode.set(true);
    this.configureFormForEdit();
    this.loadDocument(id);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      company: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      pdf_url: ['', [Validators.required, Validators.pattern(/.*\.pdf$/i)]],
      created_by: [''],
      external_id: [''],
      signer_name: ['', [Validators.required]],
      signer_email: ['', [Validators.required, Validators.email]],
      date_limit_to_sign: ['', [this.pastDateValidator.bind(this)]]
    });
  }

  private pastDateValidator(control: any) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }

  private configureFormForEdit(): void {
    const fieldsToDisable = ['company', 'pdf_url', 'signer_name', 'signer_email'];

    fieldsToDisable.forEach(fieldName => {
      const control = this.documentForm.get(fieldName);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  private loadCompanies(): void {
    this.documentService.getCompanies().subscribe({
      next: (companies) => this.handleCompaniesLoaded(companies),
      error: (error) => this.handleError('Erro ao carregar empresas', error)
    });
  }

  private handleCompaniesLoaded(companies: Company[]): void {
    this.companies.set(companies);
  }

  private loadDocument(id: number): void {
    this.setLoading(true);

    this.documentService.getDocument(id).subscribe({
      next: (doc) => this.handleDocumentLoaded(doc),
      error: (error) => this.handleDocumentLoadError(error)
    });
  }

  private handleDocumentLoaded(doc: Document): void {
    this.documentForm.patchValue({
      name: doc.name,
      date_limit_to_sign: doc.date_limit_to_sign || ''
    });

    this.setLoading(false);
  }

  private handleDocumentLoadError(error: any): void {
    this.handleError('Erro ao carregar documento', error);
    this.navigateToDocumentList();
  }

  private isFormValid(): boolean {
    return this.documentForm.valid;
  }

  private handleInvalidForm(): void {
    this.markFormGroupTouched();
    this.showSnackBar('Por favor, corrija os erros no formulário');
  }

  private processFormSubmission(): void {
    this.setLoading(true);
    const submitData = this.prepareSubmitData();

    const operation = this.getSubmissionOperation(submitData);

    operation.subscribe({
      next: (response) => this.handleSubmissionSuccess(response),
      error: (error) => this.handleSubmissionError(error)
    });
  }

  private prepareSubmitData(): any {
    const formData = this.documentForm.value;

    return this.isEditMode()
      ? {
        name: formData.name,
        date_limit_to_sign: formData.date_limit_to_sign || null
      }
      : {
        ...formData,
        date_limit_to_sign: formData.date_limit_to_sign || null
      };
  }

  private getSubmissionOperation(data: any) {
    return this.isEditMode()
      ? this.documentService.updateDocument(this.documentId!, data)
      : this.documentService.createDocument(data);
  }

  private handleSubmissionSuccess(response: any): void {
    const message = `Documento ${this.isEditMode() ? 'atualizado' : 'criado'} com sucesso`;
    this.showSnackBar(message, 2000);
    this.navigateToDocumentList();
  }

  private handleSubmissionError(error: any): void {
    const errorMessage = error.error?.error || error.error?.message || 'Erro ao salvar documento';
    this.showSnackBar(errorMessage, 5000);
    this.setLoading(false);
  }

  private getFormErrors(): any {
    const errors: any = {};

    Object.keys(this.documentForm.controls).forEach(key => {
      const control = this.documentForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });

    return errors;
  }

  private markFormGroupTouched(): void {
    Object.values(this.documentForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Utility methods
  private setLoading(state: boolean): void {
    this.loading.set(state);
  }

  private showSnackBar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', { duration });
  }

  private navigateToDocumentList(): void {
    this.router.navigate(['/documents']);
  }

  private handleError(message: string, error: any): void {
    this.showSnackBar(message);
    this.setLoading(false);
  }
}
