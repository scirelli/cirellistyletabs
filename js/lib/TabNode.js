var cirelli = cirelli || {};

cirelli.TabNode = (function(Node) {
    function TabNode(title, id){
        Node.call(this, title, id, true);
    }
    TabNode.prototype = new Node();
    
    return TabNode;
})(cirelli.Node);
