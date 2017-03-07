if(!Element.prototype.traverse){
    Element.prototype.traverse = function traverse(callBack){
        var node = this;

        for(var i=0, l=node.children.length,child; i<l; i++) {
            child = node.children[i];
            callBack(child);
            child.traverse(callBack);
        }
    };
}

if(!Element.prototype.iterator){
    Element.prototype.iterator = function() {
        var queue = [this];
        
        return {
            next:function next(){
                var node = queue.shift();
                
                if(node && node.children && node.children.length){
                    for(var i=0, l=node.children.length,child; i<l; i++) {
                        child = node.children[i];
                        if(child.nodeName.toLowerCase() !== 'script'){
                            child.push(child);
                        }
                    }
                }

                return node;
            },

            hasNext:function hasNext(){
                return queue.length ? true : false;
            }
        };
    };
}
