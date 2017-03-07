var cirelli = cirelli || {};

cirelli.Node = class Node {
    constructor(title, id, isWindow){
        this.title = title || '';
        this.id = id || null;
        this.isWindow = isWindow || false;
        this.children = [];
        this.parent = null;
    }
}
