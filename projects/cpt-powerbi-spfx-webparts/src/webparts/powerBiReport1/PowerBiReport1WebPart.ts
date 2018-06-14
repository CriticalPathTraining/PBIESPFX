import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import styles from './PowerBiReport1WebPart.module.scss';

import * as models from "powerbi-models";

import { PowerBiReport } from './../../models/PowerBiModels';
import { PowerBiService } from './../../services/PowerBiService';
import { PowerBiEmbeddingService } from "./../../services/PowerBiEmbeddingService";

export interface IPowerBiReport1WebPartProps {
  reportHeight: boolean;
  showPageTabs: boolean;
}

export default class PowerBiReport1WebPart extends BaseClientSideWebPart<IPowerBiReport1WebPartProps> {

  private workspaceId: string = "2b6e15ec-ac39-47d5-adeb-4851114d59d5";
  private reportId: string = "eedf8f6b-1c69-4c51-931d-f1c06dcdf36d";

  public render(): void {

    if(!this.renderedOnce){
      this.domElement.style.margin = "0px";
      this.domElement.style.padding = "0px";
    }

    this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Calling Power BI Service API to get report info');

    PowerBiService.GetReport(this.context.serviceScope, this.workspaceId, this.reportId).then((report: PowerBiReport) => {

      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      this.domElement.style.height = this.properties.reportHeight + "px";

      var config: any = {
        type: 'report',
        id: report.id,
        embedUrl: report.embedUrl,
        accessToken: report.accessToken,
        tokenType: models.TokenType.Aad,
        permissions: models.Permissions.All,
        viewMode: models.ViewMode.View,
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: this.properties.showPageTabs,
        }
      };

      window.powerbi.reset(this.domElement);
      window.powerbi.embed(this.domElement, config);

    });
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Embedded Report Properties" },
          groups: [{
            groupName: "General Properties",
            groupFields: [
              PropertyPaneToggle('showPageTabs', {
                label: 'Show Page Tabs',
                onText: 'Yes',
                offText: 'No'
              }),
              PropertyPaneSlider("reportHeight", {
                label: "Report Height",
                min: 100,
                max: 1000
              })
            ]
          }
          ]
        }
      ]
    };
  }
}
