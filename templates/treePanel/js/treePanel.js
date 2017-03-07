(function() {
    const MARKUP =`<style>
            @import "bower_components/bootstrap/dist/css/bootstrap.min.css";
            :host {
                all: initial;
            }

            ul{
                list-style: none;
                padding-left:15px;
            }

            li{
                margin:2px 0px 2px 0px;
            }

            button#add{
                text-align: center;
                width:100%;
            }

            li > div.btn-group{
                width:100%;
                display:inline-flex;
                flex-direction:row;
                border-radius:4px;
            }
            
            li > div > button.btn{
                background-color:transparent;
            }

            li > div > button.title-btn{
                flex:1;
            }

            .list-group-item{
                border:none;
                padding:0;
            }
            .btn-left, .btn-middle{
                border-right:none;
            }

            .btn-middle, .btn-right{
                border-left:none;
            }

            .btn-middle{
                text-align: left;
            }

            .btn{
                padding:3px 9px;
            }
        </style>
        
        <div>
            <ul id="mainContainerTree" class="list-group">
            </ul>
            <button id="add" class="">+</button>
        </div>

        <template id="listItemTemplate">
            <li class="list-group-item">
                <div class="btn-group" role="group" aria-label="...">
                    <button type="button" class="btn btn-default btn-left" aria-label="Expand">
                        <span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
                    </button>

                    <button type="button" class="btn btn-default title-btn btn-middle" aria-label="Open">
                        <img src="" class="favicon"/>
                        <span class="title-content"></span>
                    </button>

                    <button type="button" class="btn btn-default btn-right" aria-label="Remove">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </button>
                </div>
                <ul></ul>
            </li>
        </template>`;
 
    customElements.define('cirelli-style-tabs', class CirelliStyleTabs extends HTMLElement {
        constructor() {
            super();
            init.apply(this, arguments);
        }

        get model() {
            return this.tabModel;
        }
        set model(m) {
            this.tabModel = m;
            drawTree.call(this);
        }
        
        addTab(treePanelNode){
            if(treePanelNode){
                if(!treePanelNode.title){
                    treePanelNode.title = 'New tab';
                }

                this.model.children.push(treePanelNode);
                addTabToMainList.apply(this, arguments);
            }

            return this;
        }

        connectedCallback() {
        }

        disconnectedCallback() {
        }

        attributeChangedCallback(attrName, oldVal, newVal) {
        }
    });

    function init(){
        createShadowRoot.call(this);
        attachEventHandlers.call(this);
        this.model = {title:'', children:[]};
    }
    
    function createShadowRoot() {
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = MARKUP;

        return shadowRoot;
    }
    
    function attachEventHandlers() {
        this.shadowRoot.querySelector('button#add').addEventListener('click', function(eventObject) {
            this.dispatchEvent(new Event('add-tab', {bubbles: true, composed: true}));
        });
    }

    function drawTree(node){
        let self = this;

        if(!node){
            node = this.tabModel;
        }

        var parentNode = createTab.call(this, node),
            parentNodeList = parentNode.querySelector('ul');
        
        if(node.children){
            node.children.forEach(function(child){
                parentNodeList.appendChild(drawTree.call(self, child));
            });
        }
        
        return parentNode;
    }

    function createTab(node){
       var template = this.shadowRoot.querySelector('#listItemTemplate'),
           clone =  template.content.cloneNode(true);

        clone.querySelector('span.title-content').innerHTML = node.title;
        clone.node = node;

        return clone;
    }

    function addTabToMainList(treePanelNode) {
        this.shadowRoot
            .querySelector('#mainContainerTree')
            .appendChild(drawTree.call(this, treePanelNode));
    }
})();
