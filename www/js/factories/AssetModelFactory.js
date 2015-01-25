angular.module("omniFactories")
	.factory("Asset", ["PropertyManager","$rootScope","$injector", "WHOLE_UNIT","SATOSHI_UNIT", function AssetsModelFactory(PropertyManager,$rootScope,$injector,WHOLE_UNIT,SATOSHI_UNIT ){
		var Asset = function(symbol, balance,tradable,address){
			var self = this;
			var appraiser = $injector.get('appraiser');
			self.initialize = function(){
                self.symbol = symbol;
                self.balance = balance;
                self.pendingneg = 0;
                self.pendingpos = 0;
                self.tradableAddresses = tradable ? [address] : [];
                self.watchAddresses = !tradable ? [address] : [];
                self.price = 0;

                self.addresses = function(){ 
                	return self.tradableAddresses.concat(self.watchAddresses); 
                };
                self.tradable = tradable;

				        if(symbol.substring(0, 2) == "SP"){
                	self.id = symbol.substring(2);
                } else {
                	self.id = symbol == "BTC" ? 0 : symbol == "MSC" ? 1 : symbol == "TMSC" ? 2 : null;
                	self.divisible=true;
                }

                PropertyManager.getProperty(self.id).then(function(result) {
                  var property = result.data;
                  angular.extend(self,property);
                  if (self.name == "BTC") self.name = "Bitcoin";
                  self.value = appraiser.getValue(self.balance, self.symbol, self.divisible);
                  if(self.divisible){
                      self.displayBalance = new Big(self.balance).times(WHOLE_UNIT).valueOf() 
                      self.displayPendingPos = new Big(self.pendingpos).times(WHOLE_UNIT).valueOf()
                      self.displayPendingNeg = new Big(self.pendingneg).times(WHOLE_UNIT).valueOf()
                    } else {
                      self.displayBalance = self.balance;
                      self.displayPendingPos = self.pendingpos
                      self.displayPendingNeg = self.pendingneg
                    }
                  $rootScope.$broadcast("asset:loaded", {data:self})
                });

                $rootScope.$on("balance:"+self.symbol,function(evt, delta, dneg, dpos){
            		    self.balance += delta;
                    self.pendingneg += dneg;
                    self.pendingpos += dpos;
                    if(self.divisible){
                      self.displayBalance = new Big(self.balance).times(WHOLE_UNIT).valueOf() 
                      self.displayPendingPos = new Big(self.pendingpos).times(WHOLE_UNIT).valueOf()
                      self.displayPendingNeg = new Big(self.pendingneg).times(WHOLE_UNIT).valueOf()
                    } else {
                      self.displayBalance = self.balance;
                      self.displayPendingPos = self.pendingpos
                      self.displayPendingNeg = self.pendingneg
                    }
            		    self.value = appraiser.getValue(self.balance, self.symbol, self.divisible);
                });

			}

			self.initialize();
		}

		return Asset;
	}])