App = {
  web3: null,
  contracts: {},
  url:'http://127.0.0.1:7545',
  network_id:5777,
  supervisor:null,
  current_account:null,
  value:1000000000000000000,
  index:0,
  margin:10,
  left:15,
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {   
    if (typeof web3 !== 'undefined') {
      App.web3 = new Web3(Web3.givenProvider);
    } else {
      App.web3 = new Web3(App.url);
    }
    ethereum.enable();      
    return App.initContract();  
  },

  initContract: async function() { 
    App.current_account = await ethereum.request({method: 'eth_accounts'});  
    $.getJSON('CulinaryLegacyRecipe.json', function(data) {      
      App.contracts.CulinaryLegacyRecipe = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});
      App.contracts.CulinaryLegacyRecipe.methods.contract_owner()
      .call()
      .then((r)=>{
        App.contract_owner=r;
      })
      App.contracts.CulinaryLegacyRecipe.methods.balanceOf(App.current_account[0])
        .call({from:App.current_account[0]})
        .then((receipt)=>{
          jQuery('#balance').html(" Number of recipes owned by the current account: "+ receipt)
        })
      App.fetchRecipe();
    
    }) 
    return App.bindEvents();
  },  

  bindEvents: function() {  
    $(document).on('click', '#add_recipe', function(){
       App.addRecipe(jQuery('#recipe_id').val(),jQuery('#recipe_price').val());
    });

    $(document).on('click', '#register', function(){
      App.register(); 
   });

   $(document).on('click', '#unregister', function(){
    App.unregister(); 
 });


    $(document).on('click', '#request', function(){
      App.request(jQuery('#recipe_id').val(),jQuery('#to_address').val());
   });

    $(document).on('click', '#balance_of', function(){
      App.balanceOf();
    });

    App.populateAddress();
  },

  balanceOf: async function(){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    App.contracts.CulinaryLegacyRecipe.methods.balanceOf()
      .call({from:App.current_account[0]})
      .then((receipt)=>{
        jQuery('#balance').html("  "+ receipt)
        console.log(receipt); 
      })
  } ,

  addRecipe:function(id, price){
    if(id==='' || price===''){
      alert('Please enter all values');
      return false;
    }
    var option={from:App.contract_owner}    
    App.contracts.CulinaryLegacyRecipe.methods.addRecipe(id, price)
    .send(option).on('transactionHash', function(hash){
    console.log(hash);
    location.reload()
    App.fetchRecipe();
    
  }).on('error',(e)=>{
    console.log('error')
  })
  },

  fetchRecipe:function(){     
    App.contracts.CulinaryLegacyRecipe.methods.recipeCounts().call().then((length)=>{  
      for(var i=0;i<length;i++){
        App.contracts.CulinaryLegacyRecipe.methods.recipeMap(i).call().then((r)=>{
            var card='<div class="col-lg-3"><div class="card">'+
            '<div class="card-body">'+
            '<h6 class="card-title">Recipe Id '+r.recipeId+'</h6>'+
            '<p class="card-text">Recipe Price: '+r.price+' ETH </p></div>'+                 
              $('#recipes').append(card);  
        })
      }
    })
  },
  
  request: async function(fromAddress,assetId){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    App.contracts.CulinaryLegacyRecipe.methods.recipeMap(assetId)
    .call()
    .then((r)=>{
      console.log(r);
      var option= r.price.toString();
      assetId=parseInt(assetId);
      App.contracts.CulinaryLegacyRecipe.methods.transferFrom(fromAddress,assetId)
      .send({from:App.current_account[0],value: Web3.utils.toWei(option)})
      .on('receipt',(rec)=>{
        console.log(rec)
      })
      .on('transactionHash',(hash)=>{
        location.reload()
        App.fetchAllAssets();
        
      }).on('error',(e)=>{
        console.log(e)
      })
    })

  },

  register: function() {
    alert('This address is now a member, thank you for registering ( ๑‾̀◡‾́)σ" ');
    App.contracts.CulinaryLegacyRecipe.methods.register(); 
  },

  unregister: function() {
    alert('This address is no longer a member, goodbye :('); 
    App.contracts.CulinaryLegacyRecipe.methods.unregister(); 
  }

  populateAddress : function(){  
    new Web3(App.url).eth.getAccounts((err, accounts) => {

      var option='<option></option>';
      for(var i=0;i<accounts.length;i++){
        option+='<option>'+accounts[i]+'</option>'; 
      }
      jQuery('#recipe_owner').append(option);
      jQuery('#to_address').append(option);
      jQuery('#from_address').append(option);
    });
  },

};


// don't change
$(function() {
  $(window).load(function() {
    App.init();
    toastr.options = {
      // toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      // }
    };
  });
});


// kill port ->> lsof -i tcp:3000 ->> kill [PID]