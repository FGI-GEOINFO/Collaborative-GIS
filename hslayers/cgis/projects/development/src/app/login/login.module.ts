import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { HsPanelHeaderComponent, HsPanelHelpersModule } from 'hslayers-ng'
import { HsLaymanModule } from 'hslayers-ng'
import { LoginComponent } from './login.component'

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    HsPanelHelpersModule,
    HsPanelHeaderComponent,
    HsLaymanModule
  ],
  declarations: [LoginComponent],
  exports: [],
  providers: [],
})
export class LoginModule {}