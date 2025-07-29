import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Document } from '../../models/document';
import { DocumentService } from '../../services/document';
import { MatCard, MatCardSubtitle, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCard, MatCardTitle, MatCardContent, MatCardActions,
    MatButton, MatIcon, MatProgressSpinner
  ],
  templateUrl: './document-list.html',
  styleUrls: ['./document-list.scss']
})
export class DocumentListComponent implements OnInit {
  // Signals
  documents = signal<Document[]>([]);
  loading = signal(false);
  analyses = signal<Map<number, any>>(new Map());

  // Constants
  private readonly STATUS_COLORS = {
    'pending': 'warn',
    'waiting': 'primary',
    'signed': 'accent',
    'completed': 'accent'
  };

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  // Public methods
  createDocument(): void {
    this.navigateToForm('new');
  }

  editDocument(id: number): void {
    this.navigateToForm('edit', id);
  }

  deleteDocument(id: number): void {
    if (this.confirmDeletion()) {
      this.executeDocumentDeletion(id);
    }
  }

  getStatusColor(status: string): string {
    return this.STATUS_COLORS[status as keyof typeof this.STATUS_COLORS] || 'basic';
  }

  // Analysis methods
  analyzeDocument(documentId: number): void {
    this.setLoading(true);

    this.documentService.analyzeDocument(documentId).subscribe({
      next: (response) => this.handleAnalysisSuccess(documentId, response),
      error: (error) => this.handleAnalysisError(error)
    });
  }

  getAnalysisStatus(documentId: number): string {
    const analysis = this.analyses().get(documentId);
    return analysis?.analysis_status || 'none';
  }

  hasAnalysis(documentId: number): boolean {
    return this.analyses().has(documentId);
  }

  viewAnalysis(documentId: number): void {
    const analysis = this.analyses().get(documentId);
    if (analysis) {
      this.showAnalysisDialog(analysis);
    }
  }

  deleteAnalysis(documentId: number): void {
    const analysis = this.analyses().get(documentId);
    if (analysis && confirm('Confirma exclusão da análise?')) {
      this.documentService.deleteDocumentAnalysis(analysis.id).subscribe({
        next: () => {
          const currentAnalyses = new Map(this.analyses());
          currentAnalyses.delete(documentId);
          this.analyses.set(currentAnalyses);
          this.showSnackBar('Análise excluída com sucesso');
        },
        error: (error) => this.handleAnalysisError(error)
      });
    }
  }

  getAnalysisStatusIcon(documentId: number): string {
    const status = this.getAnalysisStatus(documentId);
    switch (status) {
      case 'pending': return 'schedule';
      case 'processing': return 'sync';
      case 'completed': return 'check_circle';
      case 'failed': return 'error';
      default: return 'analytics';
    }
  }

  // Private methods
  private loadDocuments(): void {
    this.setLoading(true);

    this.documentService.getDocuments().subscribe({
      next: (response) => this.handleDocumentsResponse(response),
      error: (error) => this.handleDocumentsError(error)
    });
  }

  private handleDocumentsResponse(response: any): void {
    const documents = this.extractDocumentsFromResponse(response);
    this.documents.set(documents);
    this.setLoading(false);

    // Load analyses for documents
    this.loadDocumentAnalyses();
  }

  private loadDocumentAnalyses(): void {
    const documents = this.documents();

    documents.forEach(doc => {
      if (doc.id) {
        this.documentService.getDocumentAnalysis(doc.id).subscribe({
          next: (analysis) => {
            const currentAnalyses = new Map(this.analyses());
            currentAnalyses.set(doc.id!, analysis);
            this.analyses.set(currentAnalyses);
          },
          error: () => {
            // Analysis doesn't exist, which is fine
          }
        });
      }
    });
  }

  private handleAnalysisSuccess(documentId: number, response: any): void {
    const currentAnalyses = new Map(this.analyses());
    currentAnalyses.set(documentId, response);
    this.analyses.set(currentAnalyses);

    this.showSnackBar('Análise iniciada com sucesso');
    this.setLoading(false);

    // Poll for analysis completion if status is processing
    if (response.analysis_status === 'processing') {
      this.pollAnalysisStatus(documentId);
    }
  }

  private handleAnalysisError(error: any): void {
    this.showSnackBar('Erro ao processar análise');
    this.setLoading(false);
  }

  private pollAnalysisStatus(documentId: number): void {
    const pollInterval = setInterval(() => {
      this.documentService.getDocumentAnalysis(documentId).subscribe({
        next: (analysis) => {
          const currentAnalyses = new Map(this.analyses());
          currentAnalyses.set(documentId, analysis);
          this.analyses.set(currentAnalyses);

          if (analysis.analysis_status === 'completed' || analysis.analysis_status === 'failed') {
            clearInterval(pollInterval);
            const message = analysis.analysis_status === 'completed'
              ? 'Análise concluída'
              : 'Erro na análise';
            this.showSnackBar(message);
          }
        },
        error: () => clearInterval(pollInterval)
      });
    }, 3000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  }

  private showAnalysisDialog(analysis: any): void {
    const summary = analysis.summary || 'Não disponível';
    const insightsCount = analysis.insights?.length || 0;
    const missingTopicsCount = analysis.missing_topics?.length || 0;

    const message = `Status: ${analysis.analysis_status}\n\nResumo:\n${summary}\n\nInsights encontrados: ${insightsCount}\nTópicos em falta: ${missingTopicsCount}`;

    alert(message);
  }

  private extractDocumentsFromResponse(response: any): Document[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response.results && Array.isArray(response.results)) {
      return response.results;
    }

    return [];
  }

  private handleDocumentsError(error: any): void {
    this.showSnackBar('Erro ao carregar documentos');
    this.setLoading(false);
  }

  private confirmDeletion(): boolean {
    return confirm('Confirma exclusão do documento?');
  }

  private executeDocumentDeletion(id: number): void {
    this.documentService.deleteDocument(id).subscribe({
      next: (response) => this.handleDeletionSuccess(response),
      error: (error) => this.handleDeletionError(error)
    });
  }

  private handleDeletionSuccess(response: any): void {
    this.showSnackBar('Documento excluído', 2000);
    this.loadDocuments();
  }

  private handleDeletionError(error: any): void {
    this.showSnackBar('Erro ao excluir');
  }

  private navigateToForm(mode: 'new' | 'edit', id?: number): void {
    const route = mode === 'new'
      ? ['/documents/new']
      : ['/documents/edit', id];

    this.router.navigate(route);
  }

  // Utility methods
  private setLoading(state: boolean): void {
    this.loading.set(state);
  }

  private showSnackBar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', { duration });
  }
}
