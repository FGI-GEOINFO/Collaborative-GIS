import {Component} from '@angular/core'
import View from 'ol/View.js'
import {HsConfig, HsEventBusService, HsSidebarService, HsToastService, 
  HsLanguageService, HsPanelContainerService} from 'hslayers-ng'
import {AnalysisComponent} from './analysis/analysis.component'
import {LoginComponent} from './login/login.component'
import {HelpComponent} from './help/help.component'
 
@Component({
  selector: 'application-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class HslayersAppComponent {
  title = 'hslayers-application'
  
  constructor(
    /* Inject here all modules from HSLayers-NG which you intend to use */
    public hsConfig: HsConfig, /* public properties are visible in the template */
    private hsEventBusService: HsEventBusService, /* private properties are only visible from within this component class */
    private hsToastService: HsToastService,
    private hsLanguageService: HsLanguageService,
    private hsSidebarService: HsSidebarService, 
    private hsPanelContainerService: HsPanelContainerService, 
  ) {
    /* Setup stuff - define polygons, etc... */
    /* Define and update the HsConfig configuration object */
    this.hsConfig.update({
      componentsEnabled: { // Allows to display/hide individual GUI components. (Version added: 1.15.0)	
        guiOverlay: true,
        info: true,
        sidebar: true,
        drawToolbar: true,
        searchToolbar: false,
        measureToolbar: true,
        geolocationButton: true,
        defaultViewButton: true,
        mapControls: true,
        basemapGallery: true,
        mapSwipe: false,
        queryPopup: true,
        share: false,
      },
      clusteringDistance: 40, // Minimum distance in pixels between clusters
      mapInteractionsEnabled: true, // Enable map interactions, such as, double click zoom, keyboard zoom, pinch rotate, and more
      sidebarClosed: window.innerWidth < 767, // Specify whether sidebar should be opened or closed on startup. (Version added: 1.12.0)	
      sidebarPosition: 'right', // One of 'left', 'right', or 'bottom'
      default_layers: [], // Array<Layer<Source>> Array of layers which are OpenLayers layers and are not part of a layer group or "box" layer. They can contain extra parameters not specified in OL API such as "path", "show_in_manager", "base", "position", etc.
      mobileBreakpoint: 767, // Pixel value of CSS breakpoint activating GUI changes for mobile view. Deactivated when 'sidebarPosition' is set to 'bottom'.
      box_layers: [], // Array<ol.Group> An array of ol.layer.Group objects. used to group layers into topics. Each box layer must contain layers property which is an array of ol.layer.Layer objects similar to default_layers config property. Name of the group is contained in "title" property and path to icon image can be provided in "img" property.
      base_layers: {url: '', default: ''}, // {url: string, default: string} Set composition as source for base layers 
      senslog: {url: '', user_id: 0, group: '', user: '', liteApiPath: '', mapLogApiPath: '', senslog1Path: '', senslog2Path: '',},
      proxyPrefix: 'https://<DomainName>/proxy/', // Replace <DomainName> with actual domain. Url to use for proxy in which case url=... parameter is added to the get request. If other proxy service is used non-encoded url will be added directly to the proxyPrefix specified e.g. "/proxy/https://www.google.com" in case of "/proxy/".
      useProxy: true, // Whether to use proxy or not. Might be useful in Cordova apps, where proxying is not needed. 
      defaultDrawLayerPath: 'User generated', // Default layer path (container) for newly added drawing layers. (Version added: 1.14.0)
      defaultComposition: '', // Layers which should be added to the map on init 
      default_view: new View({ // OpenLayers view which specifies default map center, projection, zoom etc.	
        center: [1851629.0, 8177593.0],
        projection: 'EPSG:3857',
        zoom: 5,
      }),
      panelsEnabled: { // Dictionary for overriding panel visibility.	
        legend: true,
        measure: false,
        info: true,
        composition_browser: true,
        toolbar: true,
        draw: true,
        datasource_selector: true,
        layermanager: true,
        feature_table: false,
        feature_crossfilter: true,
        print: true,
        saveMap: true,
        language: false,
        permalink: false,
        compositionLoadingProgress: true,
        sensors: true,
        filter: true,
        search: false,
        tripPlanner: false,
        addData: true,
        mapSwipe: false,
      },
      errorToastDuration: 5000, // Duration of toast error message visibility [ms]	
      advancedForm: true, // Specifies if advanced save map form should be created.	
      project_name: 'HSLayers-NG', // Variable of project name which is used as a project GET parameter queries to status manager when loading compositions list and making updates and deletes.
      /*
      hostname: {
        shareService: { url: '' }, 
        user: { url: '' }, 
        default: { url: '' }, 
      },
      */ 
      mapSwipeOptions: { orientation: 'horizontal' }, // Map swipe config object
      // shareServiceUrl: '', // URL or path to share service... Usually it is on the same server and then '/wwwlibs/statusmanager2/index.php' or similar can be used. 
      // shortenUrl: (url: any) ==> {any} // By default tinyurl is used, but user provided function in config.shortenUrl can be used.
      social_hashtag: '', // Hashtag or any other text to append to title generated for sharing in social networks. 
      layerTooltipDelay: 0, // Sets a delay for tooltip closing
      searchProvider: ["geonames"], // For adding additional geo-data search providers
      language: 'en', // Used for setting application language on load (Version added: 2.5.0)
      enabledLanguages: 'fr, en', // Used for setting available languages for the application, that can later be switched to inside the "Change language" panel. (Version added: 3.1.0)
      additionalLanguages: {'fr': 'French', 'en':'English'}, // Allows adding native not supported languages (Version added: 2.5.0)
      // additionalLanguages: [key:string]:string Allows adding native not supported languages (Version added: 2.5.0)
      // query: {} object for setting query options
      queryPoint: 'hidden', // How to display point clicked on the map - 'notWithin' - Hides clicked point feature in case it would overlap with other features 'hidden' - Hides clicked point feature at all times
      popUpDisplay: 'click', // 'none', 'click', or 'hover' --- When the feature pop-ups should be displayed
      queryPopupWidgets: ['layer-name', 'feature-info', 'clear-layer'], // Array<QueryPopupWidgetsType>|Array<String> Configures query popup widgets in the order in which they are generated, and visibility.
      customQueryPopupWidgets: [], // Array<WidgetItem> Allows the user to add custom widgets to query popup.  
      preserveLastSketchPoint: false, // Determines whether the last point of drawn (sketch) feature should be preserved or not. If yes, minimum of 3 saved vertices are necessary to finish drawing of polygon (2 otherwise). (Version added: 2.4.0)
      zoomWithModifierKeyOnly: false, // Description - true: map will zoom on scroll event only if platform modifier key is also pressed. This key is CTRL on Windows or Linux and META key on macOS, respectively. Useful for page-wide maps incorporated in a singe-page design. - false: default. No additional key is required. Map zooms on sole mouse-scroll event.( Version added: 1.14.0)
      pureMap: false, // Hide all GUI elements, leaving only the map itself. Shorthand for componentsEnabled.guiOverlay: false and mapInteractionEnabled: false
      translationOverrides: false, // Not specified
      layersInFeatureTable: null, // Array<VectorLayer<VectorSource>> Layers used in the feature table panel (undefined by default)
      open_lm_after_comp_loaded: true, // Set to true to open layer manager when map composition is loaded. 
      draggable_windows: true, // Specify if panels can be dragged out of side-panel.
      connectTypes: ['wms', 'wmts', 'wfs', 'kml', 'gpx', 'geojson', 'arcgis'], // Array<String> Array of possible dataset url types in dataset/url panel. 
      uploadTypes: ['kml', 'gpx', 'geojson', 'shp', 'raster', 'raster-ts'], // Array<String> Possible dataset file types in dataset/file panel. 
      datasources: [
        {
          title: 'layman',
          url: 'https://<DomainName>/layman', // Replace <DomainName> with actual domain
          type: 'layman',
        },
      ],
      panelWidths: { // Dictionary for overriding of side-panel widths for each of the main components (Range: 400-850)
        default: 550,
        analysis: 850,
	help: 750,
      }, 
      sidebarToggleable: false, // Enable sidebar function to open/close sidebar (if false sidebar panel cannot be opened/closed through GUI)
      sizeMode: 'container', // Possible values: 'fullscreen', 'container'
      symbolizerIcons: [ // Not specified in docs
        {name: 'beach', url: '/assets/icons/beach17.svg'},
        {name: 'bicycles', url: '/assets/icons/bicycles.svg'},
        {name: 'coffee-shop', url: '/assets/icons/coffee-shop1.svg'},
        {name: 'mountain', url: '/assets/icons/mountain42.svg'},
        {name: 'warning', url: '/assets/icons/warning.svg'},
      ],
      openQueryPanelOnDrawEnd: true, // Specifies if the query panel should be opened when finished drawing 
      assetsPath: 'assets', // Configures assets location
      reverseLayerList: true, // Display layer manager layers in reverse order.
      timeDisplayFormat: '', // Specifies time display format for layer manager time-aware WMS layers.	
      saveMapStateOnReload: true, // When set to true, the list of current map layers is saved into the browser's local storage once the application is closed so they can be restored after reloading.
      pathExclusivity: true, // Determines behavior of exclusive layers... (layer.exclusive = true) visibility. If set to true, only layers with same path are affected by exclusivity.
      ngRouter: false 
    })
    
    // add analysis, login and help panels to the sidebar
    this.hsPanelContainerService.create(AnalysisComponent, {})
    this.hsPanelContainerService.create(LoginComponent, {})
    this.hsPanelContainerService.create(HelpComponent, {})

    // load language
    this.hsLanguageService.setLanguage('en')

    // change the order of the sidebar buttons
    this.hsSidebarService.buttons.subscribe(buttons => {
      const panelOrder = {
        composition_browser: 0,
        addData: 1,
        layermanager: 2,
        draw: 3,
        info: 4,
        legend: 5,
        saveMap: 6,
        analysis: 7,
        print: 8,
        login: 9,
	help: 10
      }         // language: 8,

      buttons.forEach(button => {
        if (button.panel in panelOrder) {
          button.order = panelOrder[button.panel];
        }
      })
    })

    /* Now wait for the OpenLayers Map object to load */
    this.hsEventBusService.olMapLoads.subscribe(() => {
      /* ...and display a simple toast message in the bottom-left corner */
      this.hsToastService.createToastPopupMessage(
        'READY!',
        'Your map is now ready to use.',
        {
          // minimal - white background, black text
          toastStyleClasses: 'bg-success text-white' /* Use any Bootstrap class here, see https://getbootstrap.com/docs/4.0/utilities/colors/ */
        }
      )
    })
  }
}
