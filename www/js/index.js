/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
         var canvas = document.getElementById("renderCanvas");

        //GET TOUCH
        document.addEventListener('touchstart', handleTouchEvent, true);
        document.addEventListener('touchmove', handleTouchEvent, true);
        document.addEventListener('touchend', handleTouchEvent, true);
        document.addEventListener('touchcancel', handleTouchEvent, true);

        //will adjust ship's x to latest touch
        function handleTouchEvent(e) {
            if (e.touches.length === 0 ) return;
            e.preventDefault();
            e.stopPropagation();
            var touch = e.touches[0];
            window.innerHeight
            pos =  (touch.pageX-(screenWidth/2))/5;
        }

        //SCREEN SIZE AND GLOBAL VARS
        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;

        var pos = 0;

        //SCENE CREATION
        var createScene = function () {
           // This creates a basic Babylon Scene object (non-mesh)
            var scene = new BABYLON.Scene(engine);

            //camera forward ball
            var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 150, -200), scene);
            camera.setTarget( new BABYLON.Vector3(0,40, 0));

            // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;

            // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
            var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 16, scene);

            // Move the sphere upward 1/2 its height
            sphere.position.x = pos;
            sphere.position.y = 7;
            sphere.material = new BABYLON.StandardMaterial("matBallon", scene);
            sphere.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
            sphere.material.diffuseTexture.hasAlpha = true;

            //render
            scene.registerBeforeRender(function(){
                sphere.position.x = pos;
                sphere.color="red";
                sphere.position.z ++;
                camera.position.z ++;
            });

            return scene;
        };
        
        var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        var scene = createScene();

        engine.runRenderLoop(function () {
            if (scene) {
                scene.render();
            }
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    }
};

app.initialize();
