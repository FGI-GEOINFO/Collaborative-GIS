import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {HslayersAppComponent} from './app.component';
import {HslayersModule} from 'hslayers-ng';
import {AnalysisModule} from './analysis/analysis.module';
import {LoginModule} from './login/login.module';
import {HelpModule} from './help/help.module';

@NgModule({
  declarations: [HslayersAppComponent],
  imports: [BrowserModule, HslayersModule, AnalysisModule, LoginModule, HelpModule],
  providers: [],
  bootstrap: [HslayersAppComponent],
})
export class AppModule {
  constructor() {}
}
