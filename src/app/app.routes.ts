import { Routes } from '@angular/router';
import { DocumentFormComponent } from './pages/document-form/document-form';
import { DocumentListComponent } from './pages/document-list/document-list';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'documents', pathMatch: 'full' },
      { path: 'documents', component: DocumentListComponent },
      { path: 'documents/new', component: DocumentFormComponent },
      { path: 'documents/edit/:id', component: DocumentFormComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
