"use strict";

this.name = "Risk-Based Economy";
this.description = "Adjusts prices according to trade volume - so safer systems have more 'centred' prices, and hub systems have more 'centred' prices.";

this.$tvols = [[],[],[],[],[],[],[],[]]; // cache variable

this.updateLocalCommodityDefinition = function(good, station, system) {
	if (station)
	{
		return good; // shouldn't be necessary
	}
	var info = System.infoForSystem(galaxyNumber,system);

	//	var tvol = worldScripts["oolite-populator"].$repopulatorFrequencyIncoming.traderFreighters; // generally in 0.025 .. 0.1 range with 0.05 being reasonably typical
	// tvol hasn't actually been generated at this point, though, so
	// must calculate it separately here
	if (!this.$tvols[galaxyNumber][system.ID])
	{
		var freighters = 0;
		var locals = info.systemsInRange();
		for (i = 0; i < locals.length ; i++)
		{
			// standard freighter traffic is mirrored
			local = locals[i];
			// traffic is higher between systems on opposite side of economy
			var ecomatch = -(info.economy-3.5)*(local.economy-3.5);
			var trdanger = 0;
			var rate = 0;
			// if either local or remote end is more dangerous than
			// Communist, reduce trader frequency
			if (local.government < 4)
			{
				trdanger = (4-local.government)*2.5;
			}
			if (info.government < 4)
			{
				trdanger += (4-info.government)*2.5;
			}
			// good economic match: one every 30 minutes if safe
			if (ecomatch > 0)
			{
				rate = 60/(30+trdanger);
			}
			// bad economic match: one every 2 hours if safe
			else
			{
				rate = 60/(120+(trdanger*2));
			}
		
			freighters += rate;
		}
		this.$tvols[galaxyNumber][system.ID] = freighters/180;
	}
	
	var tvol = this.$tvols[galaxyNumber][system.ID];

	// this has already been counted a bit above, but count it again
	// because that doesn't allow for how many actually get through
	var sys = info.government; // 0 = anarchy, 7 = corporate

	var bias = ((tvol + sys*0.01)-0.07)*10;
	// approximate range -0.5 ..0.8 
	bias = bias * (0.75 + Math.random()/2);
	if (bias > 0.9) { bias = 0.9; }
	// adjusted range -0.625 .. 1.0
	// positive means "centre this more"
	
//	var oldprice = good.price;
	good.price = Math.floor(good.price + ((good.price_average - good.price) * bias));
//	log(this.name,"Adjusted "+good.key+" from "+oldprice+" to "+good.price+" (bias="+bias+" => "+tvol+","+sys+")");
	return good;
}