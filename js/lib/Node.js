var cirelli = cirelli || {};

cirelli.Node = (function() {
    function Node(title, id, isWindow){
        this.title = title || '';
        this.id = id || null;
        this.isWindow = isWindow || false;
        this.child = [];
        this.parent = null;
    }

    return Node;
})();
