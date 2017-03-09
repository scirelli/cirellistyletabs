var cirelli = cirelli || {};

(function() {
    const NONE       = 0,
          DRAG_ENTER = 1,
          DRAG_EXIT  = 2
          DRAG_START = 3,
          DRAG_END   = 4,
          DRAG_LEAVE = 5,
          DRAG_OVER  = 6,
          DRAG_DROP  = 7;

    const BEFORE_BEGIN = 'beforebegin', // Before the element itself.
          AFTER_BEGIN  = 'afterbegin',  // Just inside the element, before its first child.
          BEFORE_END   = 'beforeend',   // Just inside the element, after its last child.
          AFTER_END    = 'afterend';    // After the element itself.

    cirelli.TreePanelDragable = class TreePanelDragable {
        constructor(liElement, parentElement){
            this.element = liElement;
            this.registerEventListeners();
            this.dragState = NONE;
            this.parentElement = parentElement;
        }

        registerEventListeners(){
            let self = this;

            this.element.addEventListener('dragenter', function dragEnter(ev) {
                self.onDragEnter(ev);
            });

            this.element.addEventListener('dragexit', function dragExit(ev) {
                self.onDragExit(ev);
            });

            this.element.addEventListener('dragstart', function dragStart(ev) {
                self.onDragStart(ev);
            });

            this.element.addEventListener('dragend', function dragEnd(ev) {
                self.onDragEnd(ev);
            });
            
            this.element.addEventListener('dragleave', function dragLeave(ev) {
                self.onDragLeave(ev);
            });

            this.element.addEventListener('dragover', function dragOver(ev) {
                self.onDragOver(ev);
            });

            this.element.addEventListener('drop', function dragOver(ev) {
                self.onDrop(ev);
            });
        }

        onDragEnter(ev){
            ev.preventDefault();
            let li = ev.target,
                txt = '';
            
            if(li.nodeName !== 'LI'){
                li = this.firstParentNodeByName(li, 'LI');
            }
            if(ev.target.querySelector('.title-content')){
                txt = ev.target.querySelector('.title-content').innerHTML;
            }

            this.setState(DRAG_ENTER);
            console.log('Drag enter.' + txt);
        }
        onDragExit(ev){
            ev.preventDefault();
            let li = ev.target,
                txt = '';

            if(ev.target.querySelector('.title-content')){
                txt = ev.target.querySelector('.title-content').innerHTML;
            }

            console.log('Drag enter.' + txt);
            this.setState(DRAG_EXIT);
        }

        onDragStart(ev){
            //ev.preventDefault(); //Stops the drag from happening.
            let li = ev.target,
                txt = '';

            ev.dataTransfer.dropEffect = "move";
            this.setState(DRAG_START);
            
            this.markAsElementBeingDragged(li);
            if(li.querySelector('.title-content')){
                txt = li.querySelector('.title-content').innerHTML;
            }
            console.log('Drag started on' + txt + '\n\t' + li);
        }
        onDragEnd(ev){
            ev.preventDefault();
            let txt = '';
            
            this.setState(DRAG_END);
            if(ev.target.querySelector('.title-content')){
                txt = ev.target.querySelector('.title-content').innerHTML;
            }
            console.log('Drag end.' + txt);
            this.removeAllGhosts();
        }

        onDragOver(ev){
            ev.preventDefault();

            let li = ev.target;

            if(li.nodeName !== 'LI'){
                li = this.firstParentNodeByName(li, 'LI');
            }

            if(this.determineInsertLocation(ev.y, li.getBoundingClientRect()) === AFTER_END){
                if(!li.classList.contains('tab-insert-after-active')){
                    li.classList.add('tab-insert-after-active');
                }
                li.classList.remove('tab-insert-before-active');
            }else{
                if(!li.classList.contains('tab-insert-before-active')){
                    li.classList.add('tab-insert-before-active');
                }
                li.classList.remove('tab-insert-after-active');
            }
            console.log( '(' + ev.x + ', ' + ev.y + ')');
            this.setState(DRAG_OVER);
        }
        onDragLeave(ev){
            ev.preventDefault();
            let li = ev.target,
                txt = '';

            if(ev.target.querySelector('.title-content')){
                txt = ev.target.querySelector('.title-content').innerHTML;
            }

            this.setState(DRAG_LEAVE);
            this.removeAllGhosts();
            console.log('Drag leave.' + txt);
        }
        
        onDrop(ev){
            ev.preventDefault();
            let dropTarget = ev.target,
                self = this,
                dragElements = this.parentElement.shadowRoot.querySelectorAll('.drag-item');

            if(dropTarget.nodeName !== 'LI'){
                dropTarget = this.firstParentNodeByName(dropTarget, 'LI');
            }

            dragElements.forEach(function(el) {
                dropTarget.insertAdjacentElement(self.determineInsertLocation(ev.y, dropTarget.getBoundingClientRect()), el);
            });

            console.log(this.determineInsertLocation(ev.y, dropTarget.getBoundingClientRect()));
            cleanup();

            function cleanup() {
                self.removeAllGhosts();
                dragElements.forEach(function(el) {
                    self.unmarkElementBeingDragged(el);
                });
            };
        }

        removeAllGhosts(){
            this.parentElement.shadowRoot.querySelectorAll('li.tab-insert-before, li.tab-insert-after, li.tab-insert-before-active, li.tab-insert-after-active').forEach(function(el){
                el.classList.remove('tab-insert-after');
                el.classList.remove('tab-insert-after-active');
                el.classList.remove('tab-insert-before'); 
                el.classList.remove('tab-insert-before-active'); 
            });
        }
        addGhosts(li){
            let ghost;
            
            this.removeAllGhosts();
            
            li.classList.add('tab-insert-before');
            li.classList.add('tab-insert-after');
        }
        
        determineInsertLocation(y, rect){
            let midY = rect.bottom - (rect.height/2);

            if(y > midY){
                return AFTER_END;
            }else{
                return BEFORE_BEGIN;
            }
        }
        
        markAsElementBeingDragged(el){
            if(!el.classList.contains('drag-item')){
                el.classList.add('drag-item');
            }
        }

        unmarkElementBeingDragged(el){
            el.classList.remove('drag-item');
        }

        firstParentNodeByName(node, nodeName){
            let nodeParent = node.parentElement;

            nodeName = nodeName.toUpperCase();

            while(nodeParent){
                if(nodeParent.nodeName === nodeName){
                    return nodeParent;
                }
                nodeParent = nodeParent.parentElement;
            }

            return node;
        }

        setState(state){
            this.dragState = state;
            return this;
        }
    };
})();
