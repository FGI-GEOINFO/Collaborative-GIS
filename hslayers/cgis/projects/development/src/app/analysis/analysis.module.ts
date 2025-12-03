import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule, NgClass} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HsPanelHelpersModule, TranslateCustomPipe, HsPanelHeaderComponent} from 'hslayers-ng';
import {AnalysisComponent} from './analysis.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    TranslateCustomPipe,
    HsPanelHelpersModule,
    NgbModule,
    HsPanelHeaderComponent,
    NgClass, 
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [AnalysisComponent],
  providers: [],
})
export class AnalysisModule {}