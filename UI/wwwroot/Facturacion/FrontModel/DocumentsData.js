//@ts-check

import { EntityClass } from "../../WDevCore/WModules/EntityClass.js";
import { html } from "../../WDevCore/WModules/WComponentsTools.js";

export class DocumentsData extends EntityClass {

    /** @param {Partial<DocumentsData>} [props] */
    constructor(props) {
        super(props, 'Documents');
        for (const prop in props) {
            if (prop in this) {
                this[prop] = html`<div>${props[prop]}</div>`;
            }
        }
    }
    /**@type {HTMLElement}*/ Header;
    /**@type {HTMLElement}*/ WatherMark;
    /**@type {HTMLElement}*/ Footer;
    async GetDataFragments() {
        // @ts-ignore
        return new DocumentsData(await this.Post("ApiDocumentsData/GetDataFragments"));
    }
}