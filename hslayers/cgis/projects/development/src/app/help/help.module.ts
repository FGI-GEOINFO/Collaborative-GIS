import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core'
import {CommonModule, NgClass} from '@angular/common'
import {ReactiveFormsModule} from '@angular/forms'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'
import {HsPanelHelpersModule, HsPanelHeaderComponent} from 'hslayers-ng'
import {HelpComponent} from './help.component'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    HsPanelHelpersModule,
    NgbModule,
    HsPanelHeaderComponent,
    NgClass,
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [HelpComponent],
  providers: [],
})

export class HelpModule {}
