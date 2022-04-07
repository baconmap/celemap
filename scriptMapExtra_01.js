var _WAvars = {
	positionMsg: undefined,
	onSet: function(obj, key, value) {},
	onChanged: function(obj, key, value) {}
};

var WAvars = new Proxy(_WAvars, {
	set: function(obj, key, value) {
		let callback;
		if (obj[key] != value) {
			callback = obj.onChanged;
		}
		else {
			callback = obj.onSet;
		}
        obj[key] = value;
		callback(obj, key, value);
	}
});

WAvars.onChanged = function(obj, key, value) {
	switch(key) {
		case 'land_no':
			exitUrl_IA(obj);
			break;
	}
}

const exitUrl_IA = async (o) => {
	if (o.msgPositionTrigger != undefined) {
		await o.msgPositionTrigger.remove();
		o.msgPositionTrigger = undefined;
	}

	let idx;
	o.exitUrl_IAs.some( (item, index) => {
		idx = item.land_no_set.findIndex( v => v === o.land_no) != -1 ? index : -1; 
		if (idx != -1)
			return true;
		else
			return false;
	});
	if (idx != -1) {
		let triggerProperty = o.exitUrl_IAs[idx].trigger;
		let triggerMessageProperty = o.exitUrl_IAs[idx].message;
		if (triggerProperty && triggerProperty === 'onaction') {
			if (!triggerMessageProperty) {
				triggerMessageProperty = "Press SPACE or touch here to enter room";
			}

			o.msgPositionTrigger = WA.ui.displayActionMessage({
				message: triggerMessageProperty, //"Land No. "+o.land_no,
				callback: async () => {
					await WA.nav.goToRoom(o.exitUrl_IAs[idx].map_url);
				},
				uuid: '5bdaa52c-5a3b-4c5e-9917-457b22b05f64'
			});
	    }
	    else {
			await WA.nav.goToRoom(o.exitUrl_IAs[idx].map_url);
	    }
	}
}

var map = undefined;

const initExitUrl_IA = (layers) => {
	WAvars.exitUrl_IAs = [];
    layers.forEach( layer => {
        let properties = ("properties" in layer) ? layer.properties : undefined;
        if (properties != undefined) {
        	let exitUrl_IAO = {};
            properties.forEach( item => {
            	switch(item.name) {
            		case "goToRoom":
            			exitUrl_IAO.map_url = item.value;
            			break;
            		case "goToRoomTrigger":
            			exitUrl_IAO.trigger = item.value;
            			break;
            		case "goToRoomTriggerMessage":
            			exitUrl_IAO.message = item.value;
            			break;
            	}
            });
            if (exitUrl_IAO.map_url) {
            	let land_no_set = [];
            	layer.data.forEach( (value, index) => {
            		if (value) {
            			land_no_set.push(index+1);
            		}
            	});
            	if (land_no_set.length > 0) {
	        		exitUrl_IAO.land_no_set = [ ... land_no_set ];
					WAvars.exitUrl_IAs.push(exitUrl_IAO);
            	}
            }
        }
    });
}

(async () => {
 	await WA.onInit();
 	map = await WA.room.getTiledMap();
	initExitUrl_IA(map.layers);
	WA.player.onPlayerMove( async (player) => {
		let x = parseInt(player.x / 32);
		let y = parseInt(player.y / 32);
		let idx = y*map.width+x;
		WAvars.land_no = idx + 1;
	});
})();

