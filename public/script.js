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
        $scope.productlist.length = 0;
        for(key in res.data.product)
            $scope.productlist.push(res.data.product[key]);
    });

    $http.get('/product/getsession').then((res)=>{
        $scope.tag = res.data.session.tagdata;
        $scope.category = res.data.session.categorydata;
        $scope.product.categoryId = $scope.category[0].category;
    });

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
            if(res.data.success === true){
                $scope.productlist = res.data.product;
                $scope.myFile = "";
                $scope.product = {
                    name : "",
                    categoryId: "",
                    mrp: "",
                    stockStatus: "",
                    description: "",
                    tagId: ""
                };
                $scope.success = res.data.msg;
            }else{
                $scope.failed = res.data.msg;
            }
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
        }).then((res)=>{console.log('ress',res);
            if(res.data.success === true){
                $scope.myFile = "";
                $scope.productlist = res.data.product;
                $scope.successcsv = res.data.msg;
            }else{
                $scope.failedcsv = res.data.msg;
            }
        })
    }

    $scope.delete = function(id){
        $http.delete('/product/deleteproduct/'+id).then((res)=>{
            if(res.data.success === true){
                $scope.successdelete = res.data.msg;
                $scope.productlist = res.data.product;
            }
        })
    }
})