import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Document, Company } from '../models/document';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8000/api/documents/';
  private companyUrl = 'http://localhost:8000/api/companies/';

  constructor(private http: HttpClient) {}

  getDocuments(companyId?: number): Observable<any> {
    let params = new HttpParams();
    if (companyId) {
      params = params.set('company_id', companyId.toString());
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getDocument(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}${id}/`);
  }

  createDocument(document: any): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, document);
  }

  updateDocument(id: number, document: any): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}${id}/`, document);
  }

  deleteDocument(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companyUrl);
  }

  analyzeDocument(documentId: number): Observable<any> {
    return this.http.post(`http://localhost:8000/api/analyzer/create/`, {
      document_id: documentId,
      force_reanalysis: false
    });
  }

  getDocumentAnalysis(documentId: number): Observable<any> {
    return this.http.get(`http://localhost:8000/api/analyzer/document/${documentId}/`);
  }

  deleteDocumentAnalysis(analysisId: number): Observable<any> {
    return this.http.delete(`http://localhost:8000/api/analyzer/delete/${analysisId}/`);
  }
}
