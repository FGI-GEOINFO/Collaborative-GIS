import {Component, OnInit} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {HsPanelBaseComponent, HsLayoutService, HsSidebarService} from 'hslayers-ng'

@Component({
  selector: 'help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})

export class HelpComponent extends HsPanelBaseComponent implements OnInit {
  name = 'help'
  panelWidthClass: string
  selectedTab = new BehaviorSubject('CGIS')
  
  constructor(
    public hsLayoutService: HsLayoutService,
    private hsSidebarService: HsSidebarService,
  ) {
    super(hsLayoutService)
  }
  
  ngOnInit(): void {
    const panelWidth = this.hsLayoutService.hsConfig.panelWidths[this.name] || this.hsLayoutService.hsConfig.panelWidths['default']
    this.panelWidthClass = 'hs-panel-width-${Math.round(panelWidth / 25) * 25}'

    this.hsSidebarService.addButton({    
        panel: 'help',
        module: 'help',
        order: 0,
        fits: true,
        title: 'PANEL_HEADER.HELP',
        description: 'SIDEBAR.descriptions.HELP',
        icon: 'icon-question-sign',
    })
  }

}
