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
                border-style-position:inside;
                border:3px solid transparent;
                margin:1px 0px 1px 0px;
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
                overflow:hidden;
            }

            .btn{
                padding:3px 9px;
            }

            ul.children-collapsed{
                display:none;
            }

            ul.children-expanded{
                display:block;
            }

            li.ghost{
                border: 3px dashed;
                border-radius: 4px;
                padding: 2px;
                border-color: #333;
                background-color: #ddd;
                content:"&nbsp;"
            }

            .tab-insert-before{
                border-top:dotted black;    
            }

            .tab-insert-before-active{
                border-top:dotted #80ff00;    
            }

            .tab-insert-after{
                border-bottom:dotted black;    
            }

            .tab-insert-after-active{
                border-bottom:dotted #80ff00;    
            }
        </style>
        
        <div>
            <ul id="mainContainerTree" class="list-group">
            </ul>
            <button id="add" class="">+</button>
        </div>

        <template id="listItemTemplate">
            <li class="list-group-item" draggable="true">
                <div class="btn-group" role="group" aria-label="Tab controls">
                    <button type="button" class="btn btn-default btn-left" aria-label="Expand">
                        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                    </button>

                    <button type="button" class="btn btn-default title-btn btn-middle" aria-label="Open">
                        <img src="" class="favicon"/>
                        <span class="title-content"></span>
                    </button>

                    <button type="button" class="btn btn-default btn-right" aria-label="Remove">
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </button>
                </div>
                <ul class="children-collapsed"></ul>
            </li>
        </template>
        <template id="listItemGhostTemplate">
            <li class="list-group-item ghost"></li>
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

                this.tabModel.children.push(treePanelNode);
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
        attachAddEventHandler.call(this);
        this.tabModel = {title:'', children:[]};
    }
    
    function createShadowRoot() {
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = MARKUP;

        return shadowRoot;
    }
    
    function attachAddEventHandler() {
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
        return initClonedTab.call(this, node, createTabFromTemplate.call(this));
    }

    function createTabFromTemplate(){
       return this.shadowRoot.querySelector('#listItemTemplate').content.cloneNode(true);
    }
    
    function initClonedTab(node, clone){
        clone.querySelector('span.title-content').innerHTML = node.title;
        clone.querySelector('li').dataNode = node;

        attachCloneEventHandlers.call(this, node, clone);

        return clone;
    }

    function attachCloneEventHandlers(node, clone){
        let leftBtn = clone.querySelector('button.btn-left'),
            leftBtnIcon = leftBtn.querySelector('span'),
            middleBtn = clone.querySelector('button.btn-middle'),
            rightBtn = clone.querySelector('button.btn-right'),
            liContainer = clone.querySelector('li'),
            ul = clone.querySelector('ul'),
            self = this;

        if(leftBtn){
            leftBtn.addEventListener('click', function(){
                toggleListExpanded(ul, leftBtnIcon);
            });
        }

        if(rightBtn){
            rightBtn.addEventListener('click', function(e) {
                this.dispatchEvent(new Event('remove-tab', {bubbles: true, composed: true, tabNode:node}));
                liContainer.remove();
            });
        }

        if(middleBtn){
            middleBtn.addEventListener('click', function() {
                this.dispatchEvent(new Event('clicked-tab', {bubbles: true, composed: true, tabNode:node}));
            });
        }
        
        if(liContainer){
            liContainer.tpDragable = new cirelli.TreePanelDragable(liContainer, self);
        }
    }
    
    function toggleListExpanded(ul, toggleIcon) {
        if(ul.classList.contains('children-collapsed')){
            ul.classList.remove('children-collapsed');
            ul.classList.add('children-expanded');
            toggleIcon.classList.remove('glyphicon-chevron-right');
            toggleIcon.classList.add('glyphicon-chevron-down');
        }else if(ul.classList.contains('children-expanded')){
            ul.classList.remove('children-expanded');
            ul.classList.add('children-collapsed');
            toggleIcon.classList.remove('glyphicon-chevron-down');
            toggleIcon.classList.add('glyphicon-chevron-right');
        }else{
            console.error(new Error('CSS classes not found.'));
        }
    };

    function addTabToMainList(treePanelNode) {
        this.shadowRoot
            .querySelector('#mainContainerTree')
            .appendChild(drawTree.call(this, treePanelNode));
    }
})();
