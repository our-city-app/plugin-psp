import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MerchantListComponent } from './components/merchant-list/merchant-list.component';
import { MerchantListPageComponent } from './pages/merchant-list-page/merchant-list-page.component';
import { ProjectDetailsPageComponent } from './pages/project-details-page/project-details-page.component';
import { ProjectTabsComponent } from './pages/project-tabs/project-tabs.component';
import { ProjectsPageComponent } from './pages/projects-page/projects-page.component';
import { ProjectsEffects } from './projects.effects';
import { projectsReducer } from './projects.reducer';

const routes: Routes = [
  { path: '', component: ProjectsPageComponent },
  {
    path: ':id',
    component: ProjectTabsComponent,
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      { path: 'details', component: ProjectDetailsPageComponent },
      { path: 'merchants', component: MerchantListPageComponent },
    ],
  },
];

@NgModule({
  declarations: [
    ProjectTabsComponent,
    ProjectsPageComponent,
    MerchantListPageComponent,
    ProjectDetailsPageComponent,
    MerchantListComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    EffectsModule.forFeature([ ProjectsEffects ]),
    StoreModule.forFeature('projects', projectsReducer),
    TranslateModule,
  ],
})
export class ProjectsModule {
}
