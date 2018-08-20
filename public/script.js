angular.module('App', [])
.directive('demoFileModel', function ($parse) {
    return {
        restrict: 'A', 
        link: function (scope, element, attrs) {
            var model = $parse(attrs.demoFileModel),
                modelSetter = model.assign; 
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
})
.controller('AppController', ($scope, $http)=>{
    $scope.product = {};
    $scope.productlist = [];
    $scope.tag = [];
    $scope.category = [];

    $http.get('/product/getproducts').then((res)=>{
        // $scope.productlist = res.data.product;
        $scope.productlist.length = 0;
        for(key in res.data.product)
            $scope.productlist.push(res.data.product[key]);
    });

    $http.get('/product/getsession').then((res)=>{
        $scope.tag = res.data.session.tagdata;
        $scope.category = res.data.session.categorydata;
        $scope.product.categoryId = $scope.category[0].category;
    });

    // $http.get('/product/getcategory').then((res)=>{
    //     $scope.category = res.data.category;
    // });

    $scope.submit = function(){
        var formData = new FormData;

        for(key in $scope.product){
            formData.append(key, $scope.product[key]);
        }

        formData.append('image',$scope.myFile);

        $http.post('/product/addproduct', formData,{
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then((res)=>{
            $scope.productlist = res.data.product;
            console.log('productlist',$scope.productlist);
            $scope.product = {
                name : "",
                categoryId: "",
                mrp: "",
                stockStatus: "",
                description: "",
                tagId: ""
            };
            // $scope.productlist.length = 0;
            // for(key in res.data.product)
            //     $scope.productlist.push(res.data.product[key]);
        })
    }

    $scope.uploadcsv = function(){
        var formData = new FormData;

        for(key in $scope.product){
            formData.append(key, $scope.product[key]);
        }

        formData.append('csv',$scope.myFile);

        $http.post('/product/uploadcsv', formData,{
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then((res)=>{
            $scope.productlist = res.data.product;
        })
    }

    $scope.delete = function(id){
        $http.delete('/product/deleteproduct/'+id).then((res)=>{
            $scope.productlist = res.data.product;
        })
    }
})