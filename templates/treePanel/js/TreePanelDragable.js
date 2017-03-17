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
            this.dragOverTimeoutId = 0;
        }

        registerEventListeners(){
            let self = this;

            this.element.addEventListener('dragenter', function dragEnter(ev){
                self.onDragEnter(ev);
            });

            this.element.addEventListener('dragexit', function dragExit(ev){
                self.onDragExit(ev);
            });

            this.element.addEventListener('dragstart', function dragStart(ev){
                self.onDragStart(ev);
            });

            this.element.addEventListener('dragend', function dragEnd(ev){
                self.onDragEnd(ev);
            });
            
            this.element.addEventListener('dragleave', function dragLeave(ev){
                self.onDragLeave(ev);
            });

            this.element.addEventListener('dragover', (function debouncedDragOverFactory(){
                let evObj;

                return function debouncedDragOver(ev){
                    ev.preventDefault();

                    evObj = {
                        target:ev.target,
                        x:ev.x,
                        y:ev.y
                    };

                    if(!self.dragOverTimeoutId){
                        self.dragOverTimeoutId = setTimeout(function(){
                            self.onDragOver(evObj);
                            self.dragOverTimeoutId = 0;
                        }, 100);
                    }
                };
            })());

            this.element.addEventListener('drop', function dragOver(ev){
                self.onDrop(ev);
            });
            // el.addEventListener("touchstart", handleStart, false);
            //  el.addEventListener("touchend", handleEnd, false);
            //  el.addEventListener("touchcancel", handleCancel, false);
            //  el.addEventListener("touchleave", handleEnd, false);
            //  el.addEventListener("touchmove", handleMove, false);
        }

        onDragEnter(ev){
            ev.preventDefault();
            this.setState(DRAG_ENTER);
        }
        onDragExit(ev){
            ev.preventDefault();
            this.stopDragOverTimeout();
            this.setState(DRAG_EXIT);
        }

        onDragStart(ev){
            //ev.preventDefault(); //Stops the drag from happening.
            let li = ev.target;

            ev.dataTransfer.dropEffect = "move";
            this.setState(DRAG_START);
            
            this.markAsElementBeingDragged(li);
        }
        onDragEnd(ev){
            ev.preventDefault();
            this.stopDragOverTimeout();
            this.setState(DRAG_END);
            this.removeAllGhosts();
        }

        onDragOver(ev){
            this.setState(DRAG_OVER);

            let li = ev.target,
                div;

            if(li.nodeName !== 'LI'){
                li = this.firstParentNodeByName(li, 'LI');
                if(li.nodeName !== 'LI') return;
            }
            div = li.querySelector('div.btn-group');
            if(!div){
                div = li;
            }

            switch(this.determineInsertLocation(ev.x, ev.y, div.getBoundingClientRect())){
                case AFTER_END:
                    this.removeAllGhosts();
                    li.classList.add('tab-insert-after-active');
                    break;
                case AFTER_BEGIN:
                    this.removeAllGhosts();
                    li.querySelectorAll(':scope > div > button.btn-middle,:scope > div > button.btn-right').forEach(function(el){
                        el.classList.add('tab-insert-after-as-child-active');
                    });

                    let leftBtn = li.querySelector('button.btn-left'),
                        toggleIcon = leftBtn.querySelector('span'),
                        ul = li.querySelector('ul');
                    
                    if(ul.classList.contains('children-collapsed')){
                        ul.classList.remove('children-collapsed');
                        ul.classList.add('children-expanded');
                        toggleIcon.classList.remove('glyphicon-chevron-right');
                        toggleIcon.classList.add('glyphicon-chevron-down');
                    }
                    break;
                default:
                    this.removeAllGhosts();
                    li.classList.add('tab-insert-before-active');
            }
        }
        onDragLeave(ev){
            ev.preventDefault();
            this.stopDragOverTimeout();
            let li = ev.target;

            this.setState(DRAG_LEAVE);
            this.removeAllGhosts();
        }
        
        onDrop(ev){
            ev.preventDefault();
            this.stopDragOverTimeout();

            let dropTarget = ev.target,
                dropTargetChildren,
                div,
                self = this,
                dragElements = this.parentElement.shadowRoot.querySelectorAll('.drag-item');

            if(dropTarget.nodeName !== 'LI'){
                dropTarget = this.firstParentNodeByName(dropTarget, 'LI');
            }
            div = dropTarget.querySelector('div.btn-group');
            if(!div){
                div = dropTarget;
            }
            dropTargetChildren = dropTarget.querySelector(':scope > ul');

            dragElements.forEach(function(el) {
                switch(self.determineInsertLocation(ev.x, ev.y, div.getBoundingClientRect())){
                case AFTER_END:
                    dropTarget.insertAdjacentElement(AFTER_END, el);
                    break;
                case AFTER_BEGIN:
                    dropTargetChildren.insertAdjacentElement(AFTER_BEGIN, el);
                    break;
                default:
                    dropTarget.insertAdjacentElement(BEFORE_BEGIN, el);
                }
            });

            cleanup();

            function cleanup() {
                self.removeAllGhosts();
                dragElements.forEach(function(el) {
                    self.unmarkElementBeingDragged(el);
                });
            };
        }

        removeAllGhosts(){
            this.parentElement.shadowRoot.querySelectorAll('.tab-insert-before, .tab-insert-after, .tab-insert-before-active, .tab-insert-after-active, .tab-insert-after-as-child-active').forEach(function(el){
                el.classList.remove('tab-insert-after');
                el.classList.remove('tab-insert-after-active');
                el.classList.remove('tab-insert-after-as-child-active');
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
        
        determineInsertLocation(x, y, rect){
            let midX = rect.right - (rect.width/2),
                midY = rect.bottom - (rect.height/2);

            if(isLowerLeft(x, y, midX, midY)){
                // console.debug('lower left');
                return AFTER_END;
            }else if(isLowerRight(x, y, midX, midY)){
                // console.debug('lower right');
                return AFTER_BEGIN;
            }else{
                // console.debug('top');
                return BEFORE_BEGIN;
            }

            function isLowerLeft(x, y, midX, midY) {
                return x < midX && y > midY; 
            }
            function isLowerRight(x, y, midX, midY) {
                return x >= midX && y > midY; 
            }

            function isUpperLeft(x, y, midX, midY) {
                return  x < midX && y <= midY; 
            }
            function isUpperRight(x, y, midX, midY) {
                return  x >= midX && y <= midY; 
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
        
        state(){
            return this.dragState;
        }

        stopDragOverTimeout(){
            clearTimeout(this.dragOverTimeoutId);
            this.dragOverTimeoutId = 0;
        }
    };
})();
