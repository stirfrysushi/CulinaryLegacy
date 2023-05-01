App = {
  web3: null,
  contracts: {},
  //development
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

    web3.eth.requestAccounts()
    .then(function (accounts) {
    console.log('User accounts:', accounts);
    })
    .catch(function (error) {
      console.error(error);
    });
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
      App.contracts.CulinaryLegacyRecipe.methods.balanceOf()
      .call({from:App.current_account[0]})
      .then((receipt)=>{
        jQuery('#balance').html(" Number of token owned by the current account: "+ receipt)
      })

      App.fetchAllAssets();
      
    }) 
         
    return App.bindEvents();
  },  

  bindEvents: function() {  
    $(document).on('click', '#add_recipe', function(){
       App.addRecipe(jQuery('#recipe_price').val(),jQuery('#recipe_id').val());
      
    });

    $(document).on('click', '#approve_asset', function(){
      App.approveRecipe(jQuery('#asset_id').val(),jQuery('#to_address').val());
   });

    $(document).on('click', '#balance_of', function(){
      App.balanceOf();
    });

    App.populateAddress();
  },

  populateAddress : function(){  
    new Web3(App.url).eth.getAccounts((err, accounts) => {
      // console.log(accounts[0]);
      var option='<option></option>';
      for(var i=0;i<accounts.length;i++){
        option+='<option>'+accounts[i]+'</option>'; 
      }
      jQuery('#asset_owner').append(option);
      jQuery('#to_address').append(option);
      jQuery('#from_address').append(option);
    });
  },

  balanceOf: async function(){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    App.contracts.CulinaryLegacyRecipe.methods.balanceOf()
      .call({from:App.current_account[0]})
      .then((receipt)=>{
        jQuery('#balance').html("  "+ receipt)
      })
  } ,

  addRecipe:function(price, recipeID){
    if(price==='' || recipeID===''){
      alert('Please enter all values');
      return false;
    }

    var option={from:App.contract_owner}    
    App.contracts.CulinaryLegacyRecipe.methods.addRecipe(price, recipeID)
    .send(option).on('transactionHash', function(hash){
    console.log(hash);
    location.reload()
    App.fetchAllAssets();
    
  }).on('error',(e)=>{
    console.log('error')
  })
  },

  fetchAllAssets:function(){     
    App.contracts.CulinaryLegacyRecipe.methods.assetsCount().call().then((length)=>{        
      for(var i=0;i<length;i++){
        App.contracts.CulinaryLegacyRecipe.methods.assetMap(i)
        .call()
        .then((r)=>{
          App.contracts.CulinaryLegacyRecipe.methods.ownerOf(r.assetId).call().then((result)=>{
            App.contracts.CulinaryLegacyRecipe.methods.assetApprovals(r.assetId).call().then((res)=>{
              if(res==0){
                res='None'
              } 
              
              var card='<div class="col-lg-3"><div class="card">'+
              '<div class="card-body">'+
              '<h6 class="card-title">Asset # '+r.assetId+'</h6>'+
              '<p class="card-text">Price: '+r.price+' ETH </p></div>'+              
              '<div class="card-footer">'+'<small><b>Owner:</b> '+result+'<br><b>Approved:</b> '+res+'</small></div></div></div>';            
                $('#assets').append(card);
              })  
            })
        })
      }

    })
  },

  approveRecipe: async function(id,to_address){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    var option={from:App.current_account[0], gasLimit: "1000000"};
    App.contracts.CulinaryLegacyRecipe.methods.addApproval(to_address,parseInt(id))
    .send(option)
      // .on('receipt',(r)=>{
      // })
    .on('transactionHash',(hash)=>{
      location.reload()
      App.fetchAllAssets();
      
    }).on('error',(e)=>{
      console.log(e)
    })
  },
  TransferRecipe: async function(fromAddress,assetId){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    App.contracts.CulinaryLegacyRecipe.methods.assetMap(assetId)
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

ClearApproval: async function(id,to_address){
  App.current_account = await ethereum.request({method: 'eth_accounts'});
  var option={from:App.current_account[0]};  
  id=parseInt(id);   
  App.contracts.CulinaryLegacyRecipe.methods.clearApproval(id,to_address)
  .send(option)
  .on('transactionHash',(hash)=>{
    
    location.reload()
    App.fetchAllAssets();
  }).on('error',(e)=>{
    console.log(e)
  })
},


}


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
