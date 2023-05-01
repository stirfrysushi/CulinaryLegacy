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
    ethereum.enable();      
    return App.initContract();
      
  },

  initContract: async function() { 
    App.current_account = await ethereum.request({method: 'eth_accounts'});  
    $.getJSON('CulinaryLegacyRecipe.json', function(data) {      
      App.contracts.RealEstate = new App.web3.eth.Contract(data.abi, data.networks[App.network_id].address, {});
      App.contracts.RealEstate.methods.supervisor()
      .call()
      .then((r)=>{
        // console.log("Supervisor: "+ r);
        App.supervisor=r;
      })
      App.contracts.RealEstate.methods.balanceOf()
      .call({from:App.current_account[0]})
      .then((receipt)=>{
        jQuery('#balance').html(" Number of token owned by the current account: "+ receipt)
        // console.log(receipt);
      })

      App.fetchAllAssets();
      
      
    }) 
         
    return App.bindEvents();
  },  

  bindEvents: function() {  
    $(document).on('click', '#add_asset', function(){
       App.addAsset(jQuery('#asset_price').val(),jQuery('#asset_owner').val());
      
    });
    $(document).on('click', '#approve_asset', function(){
      App.ApproveAsset(jQuery('#asset_id').val(),jQuery('#to_address').val());
   });

   $(document).on('click', '#transfer_asset', function(){
    App.TransferAsset(jQuery('#from_address').val(),jQuery('#transfer_asset_id').val());
   });

    $(document).on('click', '#build_asset', function(){
      App.BuildAsset(jQuery('#build_asset_id').val(),jQuery('#build_asset_value').val());
    });

    $(document).on('click', '#clear_approval', function(){
      App.ClearApproval(jQuery('#asset_id').val(),jQuery('#to_address').val());
    });

    $(document).on('click', '#appreciate_asset', function(){
      App.Appreciate(jQuery('#assess_asset_id').val(),jQuery('#assess_value').val());
    });

    $(document).on('click', '#depreciate_asset', function(){
      App.Depreciate(jQuery('#assess_asset_id').val(),jQuery('#assess_value').val());
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
    App.contracts.RealEstate.methods.balanceOf()
      .call({from:App.current_account[0]})
      .then((receipt)=>{
        jQuery('#balance').html("  "+ receipt)
        // console.log(receipt);
      })
  } ,

  addAsset:function(price,owner){
    if(price==='' || owner===''){
      alert('Please enter all values');
      return false;
    }

    var option={from:App.supervisor}    
    App.contracts.RealEstate.methods.addAsset(price,owner)
    .send(option).on('transactionHash', function(hash){
    console.log(hash);
    location.reload()
    App.fetchAllAssets();
    
  }).on('error',(e)=>{
    console.log('error')
  })
  },

  fetchAllAssets:function(){     
    App.contracts.RealEstate.methods.assetsCount().call().then((length)=>{        
      for(var i=0;i<length;i++){
        App.contracts.RealEstate.methods.assetMap(i)
        .call()
        .then((r)=>{
          App.contracts.RealEstate.methods.ownerOf(r.assetId).call().then((result)=>{
            App.contracts.RealEstate.methods.assetApprovals(r.assetId).call().then((res)=>{
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

  ApproveAsset: async function(id,to_address){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    var option={from:App.current_account[0], gasLimit: "1000000"};
    App.contracts.RealEstate.methods.addApproval(to_address,parseInt(id))
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
  TransferAsset: async function(fromAddress,assetId){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    App.contracts.RealEstate.methods.assetMap(assetId)
    .call()
    .then((r)=>{
      console.log(r);
      var option= r.price.toString();
      assetId=parseInt(assetId);
      App.contracts.RealEstate.methods.transferFrom(fromAddress,assetId)
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
  BuildAsset: async function(assetId,value){
    App.current_account = await ethereum.request({method: 'eth_accounts'});
    App.contracts.RealEstate.methods.build(parseInt(assetId),parseInt(value))
    .send({from:App.current_account[0],value:Web3.utils.toWei(value.toString())})
    .on('receipt',(r)=>{
      location.reload()
      App.fetchAllAssets();
      
    })
  } ,

ClearApproval: async function(id,to_address){
  App.current_account = await ethereum.request({method: 'eth_accounts'});
  var option={from:App.current_account[0]};  
  id=parseInt(id);   
  App.contracts.RealEstate.methods.clearApproval(id,to_address)
  .send(option)
  .on('transactionHash',(hash)=>{
    
    location.reload()
    App.fetchAllAssets();
  }).on('error',(e)=>{
    console.log(e)
  })
},
Appreciate:function(assetId,appreciationValue){
App.contracts.RealEstate.methods.appreciate(parseInt(assetId),parseInt(appreciationValue))
.send({from:App.supervisor})
.on('receipt',(r)=>{
  location.reload()
  App.fetchAllAssets();
  
})
} ,
Depreciate:function(assetId,depreciationValue){
App.contracts.RealEstate.methods.depreciate(parseInt(assetId),parseInt(depreciationValue))
.send({from:App.supervisor})
.on('receipt',(r)=>{
  location.reload()
  App.fetchAllAssets();
  
})
} 
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
