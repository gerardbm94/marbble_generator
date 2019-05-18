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
		//GLOBAL VARS
		var canvas = document.getElementById("renderCanvas");
        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;
        var pos = 0;
		var velocity = 1.5;
		
		//init save
		var save_mode = '';
		var reset_counters = false;
		var insert_obj = false;
		window.level_info = {
			'path': [],
			'objects': []
		};
		
        //CONTROL TOUCH
        function handleTouchEvent(e) {
            if (e.touches.length === 0 ) return;
            e.preventDefault();
            e.stopPropagation();
            var touch = e.touches[0];
            pos =  (touch.pageX-(screenWidth/2))/5;
        }
		
		function handleMouseEvent(e) {
            e.preventDefault();
            e.stopPropagation();
            pos =  (e.pageX-(screenWidth/2))/5;
        }

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

            //render
            scene.registerBeforeRender(function(){
				//reset?
				if(reset_counters) {
					reset_counters = false;
					
					//reset positions
					sphere.position.z = 0;
                	camera.position.z = -200;
					
					//play music
					document.getElementById('quisap').currentTime = 0;
				}
				else {
					sphere.position.z += velocity;
                	camera.position.z = sphere.position.z-200;
				}
         		
				//path recording
				if(save_mode == 'p') {
					//ball position
					sphere.position.x = pos;
					
					//ball color
					var mat = new BABYLON.StandardMaterial("mat1", scene);
            		mat.alpha = 1.0;
            		mat.diffuseColor = new BABYLON.Color3(0,1,0);
					sphere.material = mat;
					
					//save position
					window.level_info.path.push(sphere.position.x);
				}
				
				//objects recording
				if(save_mode == 'o') {
					var zPath = Math.round(sphere.position.z/velocity);
					if (window.level_info.path.length > zPath) {
						//ball position
						sphere.position.x = window.level_info.path[zPath];
						
						//ball color
						var mat = new BABYLON.StandardMaterial("mat1", scene);
            			mat.alpha = 1.0;
            			mat.diffuseColor = new BABYLON.Color3(0,1,0);
						sphere.material = mat;
						
						//insert
						window.level_info.objects.push(insert_obj);
						insert_obj = false;
					}
					else {
						save_mode = '';
						
						//insert objects
						for (var i = 0; i < window.level_info.objects.length; i++) {
							if (window.level_info.objects[i]) {
								var box = BABYLON.Mesh.CreateBox("Box_"+i, 10.0, scene);
								box.position.x = window.level_info.path[i];
								box.position.y = 5;
								box.position.z = i*velocity;
							}
						}
					}
				}
				
				//render
				if(save_mode == '') {
					//ball position
					sphere.position.x = pos;
					
					//ball color
					var mat = new BABYLON.StandardMaterial("mat1", scene);
            		mat.alpha = 1.0;
            		mat.diffuseColor = new BABYLON.Color3(1,0,0);
					sphere.material = mat;
				}
            });
			
            return scene;
        };
        
		//ENGINE INIT
        var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        var scene = createScene();
        engine.runRenderLoop(function () {
            if (scene) {
                scene.render();
            }
        });

        //RESIZE
        window.addEventListener("resize", function () {
            engine.resize();
        });
		
		//GET TOUCH
        document.addEventListener('touchstart', handleTouchEvent, true);
        document.addEventListener('touchmove', handleTouchEvent, true);
        document.addEventListener('touchend', handleTouchEvent, true);
        document.addEventListener('touchcancel', handleTouchEvent, true);
		
		//mouse move
		document.addEventListener('mousemove', handleMouseEvent, true);

		//keydown
		window.addEventListener("keydown", function (e) {
			console.log('save_mode:' + save_mode);
			console.log('key:' + e.key);
			
			//play music
			if(e.key == 'm') {
				document.getElementById('quisap').play();
			}
			
			//disabled -> path
			else if((save_mode == '') && (e.key == 'p')) {
				save_mode = 'p';
				reset_counters = true;
			}
			
			//path -> disabled
			else if((save_mode == 'p') && (e.key == 'p')) {
				save_mode = '';
				reset_counters = true;
				
				//insert path
				var path = [];
				for (var i = 0; i < window.level_info.path.length; i++) {
					path.push(new BABYLON.Vector3(window.level_info.path[i], 0, i*velocity));
				}
				var myShape = [new BABYLON.Vector3(-5, 0, 0), new BABYLON.Vector3(5, 0, 0)];
				var extrusion = BABYLON.MeshBuilder.ExtrudeShape("caca", {shape: myShape, path: path, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true}, scene);
			}
			
			//disabled --> objects (it ends by code)
			else if((save_mode == '') && (e.key == 'o')) {
				save_mode = 'o';
				reset_counters = true;
			}
			
			//object --> space insert object
			else if((save_mode == 'o') && (e.key == ' ')) {
				insert_obj = true;
			}
			
			//disabled --> reset
			else if((save_mode == '') && (e.key == 'r')) {
				reset_counters = true;
			}
			
        });
		
    }
};

app.initialize();

function down_level() {
	var content = JSON.stringify(window.level_info);
	var fileName = 'level.json';
	contentType = 'application/json';
	
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
