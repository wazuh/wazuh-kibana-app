import fs from 'fs';
import path from 'path';
import PdfPrinter from 'pdfmake/src/printer';
import clockIconRaw from './clock-icon-raw';
import filterIconRaw from './filter-icon-raw';
import {
  AgentsVisualizations,
  OverviewVisualizations
} from '../../integration-files/visualizations';
import { log } from '../logger';
import * as TimSort from 'timsort';

const COLORS = {
  PRIMARY: '#00a9e5'
};

const pageConfiguration = {
  styles: {
    h1: {
      fontSize: 22,
      monslight: true,
      color: COLORS.PRIMARY
    },
    h2: {
      fontSize: 18,
      monslight: true,
      color: COLORS.PRIMARY
    },
    h3: {
      fontSize: 16,
      monslight: true,
      color: COLORS.PRIMARY
    },
    h4: {
      fontSize: 14,
      monslight: true,
      color: COLORS.PRIMARY
    },
    standard: {
      color: '#333'
    },
    whiteColorFilters: {
      color: '#FFF',
      fontSize: 14
    },
    whiteColor: {
      color: '#FFF'
    }
  },
  pageMargins: [40, 80, 40, 80],
  header: {
    margin: [40, 20, 0, 0],
    columns: [
      {
        image: path.join(__dirname, '../../../public/assets/logo.png'),
        width: 190
      },
      {
        text: 'info@wazuh.com\nhttps://wazuh.com',
        alignment: 'right',
        margin: [0, 0, 40, 0],
        color: COLORS.PRIMARY
      }
    ]
  },
  content: [],
  footer(currentPage, pageCount) {
    return {
      columns: [
        {
          text: 'Copyright © 2021 Wazuh, Inc.',
          color: COLORS.PRIMARY,
          margin: [40, 40, 0, 0]
        },
        {
          text: 'Page ' + currentPage.toString() + ' of ' + pageCount,
          alignment: 'right',
          margin: [0, 40, 40, 0],
          color: COLORS.PRIMARY
        }
      ]
    };
  },
  pageBreakBefore(currentNode, followingNodesOnPage) {
    if (currentNode.id && currentNode.id.includes('splitvis')) {
      return (
        followingNodesOnPage.length === 6 ||
        followingNodesOnPage.length === 7
      );
    }
    if (
      (currentNode.id && currentNode.id.includes('splitsinglevis')) ||
      (currentNode.id && currentNode.id.includes('singlevis'))
    ) {
      return followingNodesOnPage.length === 6;
    }
    return false;
  }
};

const fonts = {
  Roboto: {
    normal: path.join(
      __dirname,
      '../../../public/assets/opensans/OpenSans-Light.ttf'
    ),
    bold: path.join(
      __dirname,
      '../../../public/assets/opensans/OpenSans-Bold.ttf'
    ),
    italics: path.join(
      __dirname,
      '../../../public/assets/opensans/OpenSans-Italic.ttf'
    ),
    bolditalics: path.join(
      __dirname,
      '../../../public/assets/opensans/OpenSans-BoldItalic.ttf'
    ),
    monslight: path.join(
      __dirname,
      '../../../public/assets/opensans/Montserrat-Light.ttf'
    )
  }
};

export class ReportPrinter{
  private _content: any[];
  private _printer: PdfPrinter;
  constructor(){
    this._printer = new PdfPrinter(fonts);
    this._content = [];
  }
  addContent(...content: any){
    this._content.push(...content);
    return this;
  }
  addConfigTables(tables: any){
    log(
      'reporting:renderConfigTables',
      'Started to render configuration tables',
      'info'
    );
    log('reporting:renderConfigTables', `tables: ${tables.length}`, 'debug');
    for (const table of tables) {
      let rowsparsed = table.rows;
      if (Array.isArray(rowsparsed) && rowsparsed.length) {
        const rows =
          rowsparsed.length > 100 ? rowsparsed.slice(0, 99) : rowsparsed;
        this.addContent({
          text: table.title,
          style: { fontSize: 11, color: '#000' },
          margin: table.title && table.type === 'table' ? [0, 0, 0, 5] : ''
        });

        if (table.title === 'Monitored directories') {
          this.addContent({
            text:
              'RT: Real time | WD: Who-data | Per.: Permission | MT: Modification time | SL: Symbolic link | RL: Recursion level',
            style: { fontSize: 8, color: COLORS.PRIMARY },
            margin: [0, 0, 0, 5]
          });
        }

        const full_body = [];

        const modifiedRows = rows.map(row => row.map(cell => ({ text: cell || '-', style: 'standard' })));
        // for (const row of rows) {
        //   modifiedRows.push(
        //     row.map(cell => ({ text: cell || '-', style: 'standard' }))
        //   );
        // }
        let widths = [];
        widths = Array(table.columns.length - 1).fill('auto');
        widths.push('*');

        if (table.type === 'config') {
          full_body.push(
            table.columns.map(col => ({
              text: col || '-',
              border: [0, 0, 0, 20],
              fontSize: 0,
              colSpan: 2
            })),
            ...modifiedRows
          );
          this.addContent({
            fontSize: 8,
            table: {
              headerRows: 0,
              widths,
              body: full_body,
              dontBreakRows: true
            },
            layout: {
              fillColor: i => (i === 0 ? '#fff' : null),
              hLineColor: () => '#D3DAE6',
              hLineWidth: () => 1,
              vLineWidth: () => 0
            }
          });
        } else if (table.type === 'table') {
          full_body.push(
            table.columns.map(col => ({
              text: col || '-',
              style: 'whiteColor',
              border: [0, 0, 0, 0]
            })),
            ...modifiedRows
          );
          this.addContent({
            fontSize: 8,
            table: {
              headerRows: 1,
              widths,
              body: full_body
            },
            layout: {
              fillColor: i => (i === 0 ? COLORS.PRIMARY : null),
              hLineColor: () => COLORS.PRIMARY,
              hLineWidth: () => 1,
              vLineWidth: () => 0
            }
          });
        }
        this.addNewLine();
      }
      log('reporting:renderConfigTables', `Table rendered`, 'debug');
    }
  }

  addTables(tables: any){
    log('reporting:renderTables', 'Started to render tables', 'info');
    log('reporting:renderTables', `tables: ${tables.length}`, 'debug');
    for (const table of tables) {
      let rowsparsed = [];
      rowsparsed = table.rows;
      if (Array.isArray(rowsparsed) && rowsparsed.length) {
        const rows =
          rowsparsed.length > 100 ? rowsparsed.slice(0, 99) : rowsparsed;
        this.addContent({
          text: table.title,
          style: 'h3',
          pageBreak: 'before'
        });
        this.addNewLine();
        const full_body = [];
        const sortTableRows = (a, b) =>
          parseInt(a[a.length - 1]) < parseInt(b[b.length - 1])
            ? 1
            : parseInt(a[a.length - 1]) > parseInt(b[b.length - 1])
            ? -1
            : 0;

        TimSort.sort(rows, sortTableRows);

        const modifiedRows = rows.map(row => row.map(cell => ({ text: cell || '-', style: 'standard' })));

        const widths = Array(table.columns.length - 1).fill('auto');
        widths.push('*');

        full_body.push(
          table.columns.map(col => ({
            text: col || '-',
            style: 'whiteColor',
            border: [0, 0, 0, 0]
          })),
          ...modifiedRows
        );
        this.addContent({
          fontSize: 8,
          table: {
            headerRows: 1,
            widths,
            body: full_body
          },
          layout: {
            fillColor: i => (i === 0 ? COLORS.PRIMARY : null),
            hLineColor: () => COLORS.PRIMARY,
            hLineWidth: () => 1,
            vLineWidth: () => 0
          }
        });
        this.addNewLine();
        log('reporting:renderTables', `Table rendered`, 'debug');
      }
    }
  }
  addTimeRangeAndFilters(from, to, filters, timeZone){
    log(
      'reporting:renderTimeRangeAndFilters',
      `Started to render the time range and the filters`,
      'info'
    );
    log(
      'reporting:renderTimeRangeAndFilters',
      `from: ${from}, to: ${to}, filters: ${filters}, timeZone: ${timeZone}`,
      'debug'
    );
    const fromDate = new Date(
      new Date(from).toLocaleString('en-US', { timeZone })
    );
    const toDate = new Date(new Date(to).toLocaleString('en-US', { timeZone }));
    const str = `${this.formatDate(fromDate)} to ${this.formatDate(toDate)}`;

    this.addContent({
      fontSize: 8,
      table: {
        widths: ['*'],
        body: [
          [
            {
              columns: [
                {
                  svg: clockIconRaw,
                  width: 10,
                  height: 10,
                  margin: [40, 5, 0, 0]
                },
                {
                  text: str || '-',
                  margin: [43, 0, 0, 0],
                  style: 'whiteColorFilters'
                }
              ]
            }
          ],
          [
            {
              columns: [
                {
                  svg: filterIconRaw,
                  width: 10,
                  height: 10,
                  margin: [40, 6, 0, 0]
                },
                {
                  text: filters || '-',
                  margin: [43, 0, 0, 0],
                  style: 'whiteColorFilters'
                }
              ]
            }
          ]
        ]
      },
      margin: [-40, 0, -40, 0],
      layout: {
        fillColor: () => COLORS.PRIMARY,
        hLineWidth: () => 0,
        vLineWidth: () => 0
      }
    });

    this.addContent({ text: '\n' });
    log(
      'reporting:renderTimeRangeAndFilters',
      'Time range and filters rendered',
      'debug'
    );
  }
  addVisualizations(visualizations, isAgents, tab){
    log(
      'reporting:renderVisualizations',
      `${visualizations.length} visualizations for tab ${tab}`,
      'info'
    );
    const single_vis = visualizations.filter(item => item.width >= 600);
    const double_vis = visualizations.filter(item => item.width < 600);

    single_vis.forEach(visualization => {
      const title = this.checkTitle(visualization, isAgents, tab);
      this.addContent({
        id: 'singlevis' + title[0]._source.title,
        text: title[0]._source.title,
        style: 'h3'
      });
      this.addContent({ columns: [{ image: visualization.element, width: 500 }] });
      this.addNewLine();
    })

    let pair = [];

    for (const item of double_vis) {
      pair.push(item);
      if (pair.length === 2) {
        const title_1 = this.checkTitle(pair[0], isAgents, tab);
        const title_2 = this.checkTitle(pair[1], isAgents, tab);

        this.addContent({
          columns: [
            {
              id: 'splitvis' + title_1[0]._source.title,
              text: title_1[0]._source.title,
              style: 'h3',
              width: 280
            },
            {
              id: 'splitvis' + title_2[0]._source.title,
              text: title_2[0]._source.title,
              style: 'h3',
              width: 280
            }
          ]
        });

        this.addContent({
          columns: [
            { image: pair[0].element, width: 270 },
            { image: pair[1].element, width: 270 }
          ]
        });

        this.addNewLine();
        pair = [];
      }
    }

    if (double_vis.length % 2 !== 0) {
      const item = double_vis[double_vis.length - 1];
      const title = this.checkTitle(item, isAgents, tab);
      this.addContent({
        columns: [
          {
            id: 'splitsinglevis' + title[0]._source.title,
            text: title[0]._source.title,
            style: 'h3',
            width: 280
          }
        ]
      });
      this.addContent({ columns: [{ image: item.element, width: 280 }] });
      this.addNewLine();
    }
  }
  formatDate(date: Date): string {
    log('reporting:formatDate', `Format date ${date}`, 'info');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const str = `${year}-${month < 10 ? '0' + month : month}-${
      day < 10 ? '0' + day : day
    }T${hours < 10 ? '0' + hours : hours}:${
      minutes < 10 ? '0' + minutes : minutes
    }:${seconds < 10 ? '0' + seconds : seconds}`;
    log('reporting:formatDate', `str: ${str}`, 'debug');
    return str;
  }
  checkTitle(item, isAgents, tab) {
    log(
      'reporting:checkTitle',
      `Item ID ${item.id}, from ${
        isAgents ? 'agents' : 'overview'
      } and tab ${tab}`,
      'info'
    );

    const title = isAgents
      ? AgentsVisualizations[tab].filter(v => v._id === item.id)
      : OverviewVisualizations[tab].filter(v => v._id === item.id);
    return title;
  }

  addSimpleTable({columns, items, title}: {columns: ({id: string, label: string})[], title?: (string | {text: string, style: string}), items: any[]}){

    if (title) {
      this.addContent(typeof title === 'string' ? { text: title, style: 'h4' } : title)
        .addNewLine();
    }
  
    if (!items || !items.length) {
      this.addContent({
        text: 'No results match your search criteria',
        style: 'standard'
      });
      return this;
    }

    const tableHeader = columns.map(column => {
      return { text: column.label, style: 'whiteColor', border: [0, 0, 0, 0] };
    });

    const tableRows = items.map((item, index) => {
      return columns.map(column => {
        const cellValue = item[column.id];
        return {
          text: typeof cellValue !== 'undefined' ? cellValue : '-',
          style: 'standard'
        }
      })
    }); 

    // 385 is the max inicial width per column
    let totalLength = columns.length - 1;
    const widthColumn = 385/totalLength;
    let totalWidth = totalLength * widthColumn;
    const widthCharacter = 5; //min width per character
    const widths = new Array;
    
    for (let step = 0; step < columns.length - 1; step++) {
      let column_length = tableRows[0][step].text.length * widthCharacter;
      if (column_length <= Math.round(totalWidth / totalLength)) {
        widths.push(column_length);
        totalWidth -= column_length;
      } 
      else {
        widths.push(Math.round(totalWidth / totalLength));
        totalWidth -= Math.round((totalWidth / totalLength));
      }
      totalLength--;
    }
    widths.push('*');
  
    this.addContent({
      fontSize: 8,
      table: {
        headerRows: 1,
        widths,
        body: [tableHeader, ...tableRows]
      },
      layout: {
        fillColor: i => (i === 0 ? COLORS.PRIMARY : null),
        hLineColor: () => COLORS.PRIMARY,
        hLineWidth: () => 1,
        vLineWidth: () => 0
      }
    }).addNewLine();
    return this;
  }

  addList({title, list}: {title: string | {text: string, style: string}, list: (string | {text: string, style: string})[]}){
    return this
      .addContentWithNewLine(typeof title === 'string' ? {text: title, style: 'h2'} : title)
      .addContent({ul: list.filter(element => element)})
      .addNewLine();
  }

  addNewLine(){
    return this.addContent({text: '\n'});
  }

  addContentWithNewLine(title: any){
    return this.addContent(title).addNewLine();
  }

  addAgentsFilters(agents){
    log(
      'reporting:addAgentsFilters',
      `Started to render the authorized agents filters`,
      'info'
    );
    log(
      'reporting:addAgentsFilters',
      `agents: ${agents}`,
      'debug'
    );
    
    this.addNewLine();
    
    this.addContent({
      text:
        'NOTE: This report only includes the authorized agents of the user who generated the report',
      style: { fontSize: 10, color: COLORS.PRIMARY },
      margin: [0, 0, 0, 5]
    });

    /*TODO: This will be enabled by a config*/
    /* this.addContent({
      fontSize: 8,
      table: {
        widths: ['*'],
        body: [
          [
            {
              columns: [
                {
                  svg: filterIconRaw,
                  width: 10,
                  height: 10,
                  margin: [40, 6, 0, 0]
                },
                {
                  text: `Agent IDs: ${agents}` || '-',
                  margin: [43, 0, 0, 0],
                  style: { fontSize: 8, color: '#333' }
                }
              ]
            }
          ]
        ]
      },
      margin: [-40, 0, -40, 0],
      layout: {
        fillColor: () => null,
        hLineWidth: () => 0,
        vLineWidth: () => 0
      }
    }); */

    this.addContent({ text: '\n' });
    log(
      'reporting:addAgentsFilters',
      'Time range and filters rendered',
      'debug'
    );
  }

  async print(path: string){
    const document = this._printer.createPdfKitDocument({...pageConfiguration, content: this._content});
    await document.pipe(
      fs.createWriteStream(path)
    );
    document.end();
  }

}
