import { Component, OnInit } from '@angular/core'
import { HsPanelBaseComponent, HsLayoutService, HsSidebarService, HsCommonLaymanService } from 'hslayers-ng'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends HsPanelBaseComponent implements OnInit {
  name = 'login'
  panelWidthClass: string

  constructor(
    public hsLayoutService: HsLayoutService,
    private hsSidebarService: HsSidebarService,
    public hsCommonLaymanService: HsCommonLaymanService
  ) {
    super(hsLayoutService)
  }

  ngOnInit(): void {
    this.setupPanel()
  }

  private setupPanel(): void {
    const panelWidth = this.hsLayoutService.hsConfig.panelWidths[this.name] || this.hsLayoutService.hsConfig.panelWidths['default']
    this.panelWidthClass = `hs-panel-width-${Math.round(panelWidth / 25) * 25}`

    this.hsSidebarService.addButton({
      panel: 'login',
      module: 'login',
      order: 0,
      fits: true,
      title: 'PANEL_HEADER.LOGIN',
      description: 'SIDEBAR.descriptions.LOGIN',
      icon: 'icon-lock',
    })
  }
}
