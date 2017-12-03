'use strict';

module.exports = class client {
    
    constructor(nom, IP) {
        this.Name = nom;
        this.Ip = IP;
    }
    
    getNeighborJSON(clients_array,walls) {

        var i = clients_array.findIndex(this);

        if (i == 0 || i == clients_array.length-1)
        {
            if (i == 0)
            {
                if (walls == 1)
                {
                    var leftNeighbor = null;
                } else {
                    var leftNeighbor = clients_array[clients_array.length-1];
                }
            }
    
            if (i == clients_array.length-1){
                if (walls == 1)
                {
                    var rigthNeighbor = null;
                } else {
                    var rigthNeighbor = clients_array[0];
                }
            }
    
        } else {
            var leftNeighbor = clients_array[i-1];
            var rigthNeighbor = clients_array[i+1];
        }
        
        var Neighbor = [leftNeighbor,rigthNeighbor];

        var NeighborJSON = JSON.stringify(Neighbor);

        return NeighborJSON;
    }
}