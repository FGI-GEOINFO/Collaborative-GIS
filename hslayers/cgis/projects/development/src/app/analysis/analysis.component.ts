import {Component, OnInit, DoCheck} from '@angular/core'
import {FormArray, FormGroup, FormControl, Validators} from '@angular/forms'
import {BehaviorSubject} from 'rxjs'
import {HsPanelBaseComponent, HsLayoutService, HsSidebarService, HsLayerManagerService, HsEventBusService, 
  HsMapService, HsCommonLaymanService, HsLayerManagerMetadataService, getLaymanFriendlyLayerName, getWorkspace, getMetadata} from 'hslayers-ng'
import { Extent, getIntersection, isEmpty } from 'ol/extent'
import { transformExtent } from 'ol/proj'
import Axios from 'axios'

@Component({
  selector: 'analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
})
export class AnalysisComponent extends HsPanelBaseComponent implements OnInit, DoCheck {
  name = 'analysis'
  panelWidthClass: string
  activeLayers: any[] = []
  form: FormGroup
  selectedTab = new BehaviorSubject('Analysis')
  isAnalysisRunning = false
  progressValue = 0
  results: any[] = []
  metadataVisible: boolean[] = []
  boundingBoxDisplay: string
  current_user: string
  user_authenticated: boolean

  constructor(
    public hsLayoutService: HsLayoutService,
    private hsSidebarService: HsSidebarService,
    private hsLayerManagerService: HsLayerManagerService,
    private hsEventBusService: HsEventBusService,
    private hsMapService: HsMapService,
    private hsCommonLaymanService: HsCommonLaymanService,
    private metaDataService: HsLayerManagerMetadataService,
  ) {
    super(hsLayoutService)

    this.hsCommonLaymanService.authChange.subscribe(() => {
      console.log("Analysis panel: hsCommonLaymanService.authChange detected")
      this.user_authenticated = this.hsCommonLaymanService.isAuthenticated()
      if (this.user_authenticated) { this.current_user = this.hsCommonLaymanService.layman.user }
      console.log("Authenticated? ", this.user_authenticated)
      console.log("Current user: ", this.current_user)
    })
    this.hsEventBusService.layerManagerUpdates.subscribe(() => {this.updateActiveLayers()})
  }

  ngOnInit() {
    this.initializeForm()
    this.updateActiveLayers()

    const panelWidth = this.hsLayoutService.hsConfig.panelWidths[this.name] || this.hsLayoutService.hsConfig.panelWidths['default']
    this.panelWidthClass = `hs-panel-width-${Math.round(panelWidth / 25) * 25}`

    this.hsSidebarService.addButton({
      panel: 'analysis',
      module: 'analysis',
      order: 0,
      fits: true,
      title: 'PANEL_HEADER.ANALYSIS',
      description: 'SIDEBAR.descriptions.ANALYSIS',
      icon: 'icon-analytics-piechart',
    })

    this.hsMapService.loaded().then(() => {
      this.hsMapService.getMap().getView().on('change:center', () => this.updateBoundingBoxDisplay())
      this.hsMapService.getMap().getView().on('change:resolution', () => this.updateBoundingBoxDisplay())
      this.updateBoundingBoxDisplay()
    })
  }

  ngDoCheck() {}

  initializeForm() {
    this.form = new FormGroup({
      layers: new FormArray([]),
      resultTitle: new FormControl('', Validators.required),
    })
  }

  updateBoundingBoxDisplay() {
    const boundingBox = this.hsMapService.getMapExtentInEpsg4326()
    this.boundingBoxDisplay = `${boundingBox[0].toFixed(3)}, ${boundingBox[1].toFixed(3)}, ${boundingBox[2].toFixed(3)}, ${boundingBox[3].toFixed(3)}`
  }

  async updateActiveLayers() {
    const allLayers = this.hsLayerManagerService.data.layers.filter((l) => (l.showInLayerManager ?? true))
    // get more information about the layers via this.hsCommonLaymanService.layman?
    const filteredLayers = []

    for (const layer of allLayers) {
      if (layer.type === 'WMS') {
        filteredLayers.push(layer)
      }


      //  if (layer.source === 'memory' && layer.type === 'vector') {
      //    filteredLayers.push(layer)
      //  } else if (layer.type === 'WMS') {
          // TODO: logic for checking if underyling data is vector or raster using getLayerGeodataType or this.hsCommonLaymanService.layman --> only push if vector
      //    filteredLayers.push(layer)
      //  }
    }

    if (this.hasLayersChanged(filteredLayers)) {
      this.activeLayers = filteredLayers
      this.updateFormArray()
    }
  }

  async getLayerGeodataType(layer: any): Promise<string | null> {
    // TODO
    return null
  }

  hasLayersChanged(newLayers: any[]): boolean {
    if (newLayers.length !== this.activeLayers.length) {
      return true
    }
    for (let i = 0; i < newLayers.length; i++) {
      if (newLayers[i].title !== this.activeLayers[i]?.title) {
        return true
      }
    }
    return false
  }

  get layersFormArray(): FormArray {
    return this.form.get('layers') as FormArray
  }

  updateFormArray() {
    const layersFormArray = this.form.get('layers') as FormArray

    const existingData = layersFormArray.controls.reduce((acc, control) => {
      const title = control.get('title')?.value
      if (title) {
        acc[title] = control.value
      }
      return acc
    }, {} as Record<string, any>)

    layersFormArray.clear()

    this.activeLayers.forEach((layer) => {
      const layerData = existingData[layer.title] || { weight: 0, status: 'excluded' }

      const layerControl = new FormGroup({
	title: new FormControl(layer.title),
        weight: new FormControl(layerData.weight, [Validators.min(-1), Validators.max(1)]),
        status: new FormControl(layerData.status),
      })

      layersFormArray.push(layerControl)
    })
  }

  onWeightInputChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement
    const value = inputElement.value.trim()

    const numericRegex = /^-?\d*(\.\d+)?$/

    if (numericRegex.test(value)) {
      let parsedValue = parseFloat(value)

      if (!isNaN(parsedValue)) {
        if (parsedValue < -1) {
          parsedValue = -1
        } else if (parsedValue > 1) {
          parsedValue = 1
        }
        this.layersFormArray.at(index).get('weight').setValue(parsedValue)
      } else if (value === '' || value === '-') {
        this.layersFormArray.at(index).get('weight').setValue(0)
        inputElement.value = '0'
      }
    } else {
      this.layersFormArray.at(index).get('weight').setValue(0)
      inputElement.value = '0'
    }
  }

  onSliderChange(index: number, event: Event) {
    const inputElement = event.target as HTMLInputElement
    const value = parseFloat(inputElement.value)

    this.layersFormArray.at(index).get('weight').setValue(value)
  }

  onStatusChange(index: number) {
    const statusControl = this.layersFormArray.at(index).get('status')
    if (statusControl?.value !== 'analyzable') {
      this.layersFormArray.at(index).get('weight').setValue(0)
    }
  }

  validateForm(): boolean {
    const analyzableLayers = this.activeLayers.filter((layer, index) => {
      return this.form.value.layers[index].status === 'analyzable'
    })
    
    if (analyzableLayers.length < 2) {
      alert('At least two analyzable layers are required.')
      return false
    }
  
    // if (this.hsMapService.getMap().getView().getZoom() < 12) {
     //  alert('Zoom in more closely to the area of interest.')
    //   return false
    // }
  
    let hasIntersection = false
    const boundingBox = this.hsMapService.getMapExtentInEpsg4326() // [minX, minY, maxX, maxY]

    for (const layer of analyzableLayers) {
      const bbox = layer.layer.values_.BoundingBox.find((bbox) => bbox.crs === 'EPSG:4326')
      if (bbox && bbox.extent) {
        const layerExtent = bbox.extent
        const orderedLayerExtent = [layerExtent[1], layerExtent[0], layerExtent[3], layerExtent[2]]
        const intersection = getIntersection(orderedLayerExtent, boundingBox)
        if (!isEmpty(intersection)) {
          hasIntersection = true
          break
        }
      }
    }
  
    if (!hasIntersection) {
      alert('At least one of the analyzable layers does not intersect with the study area.')
      return false
    }
  
    return true
  }

  async run_analysis() {
    if (!this.user_authenticated) {
      alert("You must be logged in to proceed.")
      return
    }

    // Check zoom level directly here to make it as apparent as the login check
    const currentZoom = this.hsMapService.getMap().getView().getZoom()
    if (currentZoom < 14) {
      alert('Zoom in more closely to the area of interest (minimum zoom level: 14).')
      return
    }

    if (this.isAnalysisRunning) {
      alert("Analysis is already running. Please wait for it to complete before starting a new one.")
      return
    }
  
    const userConfirmed = confirm("Are you sure you want to run the analysis?")
    if (!userConfirmed) { return }

    const resultTitle = this.form.get('resultTitle')?.value
    if (!resultTitle || resultTitle.trim() === '') {
      alert('Please provide a title for the result.')
      return
    }
  
    if (!this.validateForm()) { return }
  
    this.isAnalysisRunning = true
    this.progressValue = 0
  
    const analyzableLayers = []
    const restrictedLayers = []
  
    this.form.value.layers.forEach((layer: { weight: number; status: string }, index: number) => {
        if (layer.status === 'analyzable') {
            analyzableLayers.push({
                title: this.activeLayers[index].title,
                layman_friendly_layer_name: getLaymanFriendlyLayerName(this.activeLayers[index].title),
                // workspace: getWorkspace(this.activeLayers[index].layer),
                workspace: this.activeLayers[index].source.toString().split("/")[5],
                weight: layer.weight,
            })
        }
        if (layer.status === 'restricted') {
            restrictedLayers.push({
                title: this.activeLayers[index].title,
                layman_friendly_layer_name: getLaymanFriendlyLayerName(this.activeLayers[index].title),
                // workspace: getWorkspace(this.activeLayers[index].layer),
                workspace: this.activeLayers[index].source.toString().split("/")[5],
            })
        }
    })
  
    const timestamp = new Date().toLocaleString()
  
    const analysisPayload = {
        study_area: this.hsMapService.getMapExtentInEpsg4326(),
        study_area_epsg: '4326',
        resolution: 10,
        workspace: this.current_user,
        result_title: resultTitle,
        layman_friendly_result_title: getLaymanFriendlyLayerName(resultTitle),
        analyzable_layers: analyzableLayers,
        restricted_layers: restrictedLayers,
        run_time: timestamp,
    }
  
    console.log('--------------------')
    console.log('run_analysis() called')
    console.log('analysisPayload:', JSON.stringify(analysisPayload, null, 3))
    console.log('--------------------')
  
    try {
        // Replace <DomainName> with actual domain
        const response = await Axios.post('https://<DomainName>/lls_analysis/api/run_analysis/', analysisPayload, {
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    this.progressValue = Math.round((progressEvent.loaded / progressEvent.total) * 100)
                }
            },
            timeout: 60 * 3 * 1000 // 3 mins
        })
  
        console.log("response.data: ", response.data)
        console.log("response.status: ", response.status)
        console.log('response in full:', response)
  
        this.results.push({
            name: resultTitle,
            metadata: {
                runTime: timestamp,
                analyzableLayers: analyzableLayers,
                restrictedLayers: restrictedLayers,
            }
        })
        this.metadataVisible.push(false)
  
        if (response.status === 200) {
          alert(`Analysis complete. Please check the data manager for the result layer, ${getLaymanFriendlyLayerName(resultTitle)}`)
        }
    } catch (error) {
        console.error('error running analysis:', error)
  
        if (error.response && error.response.status === 500) {
            alert('Internal Server Error: The analysis process failed. Please try again later.')
        } else if (error.response && error.response.status === 409) {
            alert(`Internal Server Error: a layer with the name ${getLaymanFriendlyLayerName(resultTitle)} already exists.`)
        } else {
            alert('An error occurred while running the analysis. Please check the console for details.')
        }
    } finally {
        this.isAnalysisRunning = false
    }
  }

  toggleMetadataVisibility(index: number) {
    this.metadataVisible[index] = !this.metadataVisible[index]
  }
}
