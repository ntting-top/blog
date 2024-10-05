import './index.styl';
import React from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
export default class Earth extends React.Component {

  state = {
    backgroundColor: '#164CCA',
    renderGlithPass: !(window.navigator.userAgent.toLowerCase().indexOf('mobile') > 0)
  }

  componentDidMount() {
    this.initThree()
    // 自动播放音频
    const audio = document.getElementById('backgroundMusic');
    if (audio) {
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  }

  initThree = () => {
    const nearDist = 0.1, farDist = 10000;
    const canvas = document.getElementById('canvas');
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearAlpha(0);
    canvas.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xeeeeee, 0, 100);
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, nearDist, farDist);
    camera.position.set(-2 * farDist, 0, 780);

    // 后期
    const composer = new EffectComposer(renderer);
    composer.addPass( new RenderPass(scene, camera));
    const glitchPass = new GlitchPass();
    composer.addPass(glitchPass);

    // 页面缩放
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    // 双击全屏
    window.addEventListener('dblclick', () => {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
          canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen();
        }
        scene.background = new THREE.Color(this.state.backgroundColor)
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        scene.background = '';
        composer.render();
      }
    });

    // 字体
    const textMesh = new THREE.Mesh();
    const loader = new FontLoader();
    loader.load('./fonts/helvetiker_regular.typeface.json', font => {
      textMesh.geometry = new TextGeometry('@dragonir\nfantastic\nthree.js\nart work', {
        font: font,
        size: 100,
        height: 40,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 30,
        bevelSize: 8,
        bevelOffset: 1,
        bevelSegments: 12
      });
      textMesh.material = material;
      textMesh.position.x = 120 * -2;
      textMesh.position.z = 120 * -1;
      scene.add(textMesh);
    });

    let mouseX = 0, mouseY = 0;
    const mouseFX = {
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2,
      coordinates: (coordX, coordY) => {
        mouseX = (coordX - mouseFX.windowHalfX) * 5;
        mouseY = (coordY - mouseFX.windowHalfY) * 5;
      },
      onMouseMove: e => {
        mouseFX.coordinates(e.clientX, e.clientY)
      },
      onTouchMove: e => {
        mouseFX.coordinates(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
      }
    };
    document.addEventListener('mousemove', mouseFX.onMouseMove, false);
    document.addEventListener('touchmove', mouseFX.onTouchMove, false);

    // 创建装饰几何体
    const generateRandomMesh = (geometry, material, count) => {
      for (let i = 0; i < count; i++) {
        let mesh = new THREE.Mesh(geometry, material);
        let dist = farDist / 3;
        let distDouble = dist * 2;
        mesh.position.x = Math.random() * distDouble - dist;
        mesh.position.y = Math.random() * distDouble - dist;
        mesh.position.z = Math.random() * distDouble - dist;
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        mesh.rotation.z = Math.random() * 2 * Math.PI;
        // 手动控制何时重新计算3D变换以获得更好的性能
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        group.add(mesh);
      }
    }

    const group = new THREE.Group();
    const octahedronGeometry = new THREE.OctahedronBufferGeometry(80);
    const material = new THREE.MeshNormalMaterial();
    generateRandomMesh(octahedronGeometry, material, 100);
    const torusGeometry = new THREE.TorusBufferGeometry(40, 25, 16, 40);
    generateRandomMesh(torusGeometry, material, 200);
    const coneGeometry = new THREE.ConeBufferGeometry(40, 80, 80);
    generateRandomMesh(coneGeometry, material, 100);
    scene.add(group);

    // 动画
    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (mouseY * -1 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      const t = Date.now() * 0.001;
      const rx = Math.sin(t * 0.7) * 0.5;
      const ry = Math.sin(t * 0.3) * 0.5;
      const rz = Math.sin(t * 0.2) * 0.5;
      group.rotation.x = rx;
      group.rotation.y = ry;
      group.rotation.z = rz;
      textMesh.rotation.x = rx;
      textMesh.rotation.y = ry;
      textMesh.rotation.z = rx;
      renderer.render(scene, camera);
      // this.state.renderGlithPass && composer.render();
    }
    animate();
  }

  handleInputChange = e => {
    this.setState({
      backgroundColor: e.target.value
    })
  }

  handleRenderChange = () => {
    this.setState({
      renderGlithPass: !this.state.renderGlithPass
    })
  }

  render () {
    return (
      <div className='floating_page' style={{ backgroundColor: this.state.backgroundColor }}>
        <div id='canvas'></div>
        <input className='color_pick' type='color' onChange={this.handleInputChange} value={this.state.backgroundColor} />
        <div className='meta'>
          {/* <a className='github' href='https://github.com/dragonir/3d' target='_blank' rel='noreferrer'>
            <svg height='32' aria-hidden='true' viewBox='0 0 16 16' version='1.1' width='32' data-view-component='true'>
              <path fill='#ffffff' fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            <span className='text'>@dragonir</span>
          </a> */}
          <div className='personal_intro'>
            <p>你好，我是牛婷婷👋，正在逐渐变成生活、技术的重度爱好者</p>
            <p>📫2024年毕业，目前就职于美团，专注于跨端开发及原生开发。</p>
            <p>🌱我希望通过我的工作在世界的某个小角落为人们带来更多的快乐和幸福</p>
            <p>👯无论是作为主导者还是合作者，我都将努力成为最优质的伙伴。👇👇👇</p>
            <p>💬WeChat：15698606299，Welcome to communicate!</p>
            <p>个签：通过广泛的阅读把自己培养成一个终生自学者，培养好奇心，每天努力使自己聪明一点点</p>
          </div>
        </div>
        <div className='personal_intro'>Hello, I am Tingting Niu, gradually becoming a heavy enthusiast of life and technology. I will graduate in 2024 and currently work at Meituan, focusing on cross-platform and native development. I hope that through my work, I can bring more joy and happiness to people in some small corner of the world. Whether as a leader or a collaborator, I will strive to be the best partner. Finally, a quote for myself: Cultivate yourself into a lifelong learner through extensive reading; foster curiosity and strive to become a little smarter every day.</div>
        <audio id="backgroundMusic" src="http://m704.music.126.net/20241005002601/2f377cb09bb2359d3655a43b56049301/jdyyaac/obj/w5rDlsOJwrLDjj7CmsOj/44173654022/2d68/54db/65fc/531e414544e5c399d29b55080c96aafa.m4a?authSecret=00000192584356d209480a3b195984d3" autoPlay loop></audio>
     </div>
    )
  }
}