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
    isAnimationRunning: true,
    isMusicPlaying: true
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
      }
    });

    // 字体
    const textMesh = new THREE.Mesh();
    const loader = new FontLoader();
    loader.load('./fonts/helvetiker_regular.typeface.json', font => {
      textMesh.geometry = new TextGeometry('have a nice day!', {
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
      if(this.state.isAnimationRunning) {
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
      }
    }
    animate();
  }

  handleInputChange = e => {
    this.setState({
      backgroundColor: e.target.value
    })
  }


  toggleMusicPlaying = () => {
    const audio = document.getElementById('backgroundMusic')    
    
    if(audio) {
      if(this.state.isMusicPlaying) {
        console.log('=========');
        console.log(audio);
        audio.pause()
      } else {
        audio.play()
      }
      this.setState(prevState => ({
        isMusicPlaying: !prevState.isMusicPlaying
      }))
    }
  }
  toggleAnimation = () => {
    this.setState(prevState => ({
      isAnimationRunning: !prevState.isAnimationRunning
    }), () => {
      if(this.state.isAnimationRunning) {
        this.initThree()
      }
    })
  }


  render () {
    return (
      <div className='floating_page' style={{ backgroundColor: this.state.backgroundColor }}>
        <div id='canvas'></div>
        {/* <input className='color_pick' type='color' onChange={this.handleInputChange} value={this.state.backgroundColor} /> */}
        <button  className='color_pick' onClick={this.toggleAnimation} >
          {this.state.isAnimationRunning ? '太眩晕了，关掉动画' : '开启动画!'}
        </button>
        {/* <button  className='color_pick' onClick={this.toggleMusicPlaying} >
          {this.state.isMusicPlaying ? '关掉音乐！' : '来点牛逼哄哄的小曲听听'}
        </button> */}
        <div className='container'>
          <div className='titleBar'>
            <a className='github' href='https://github.com/ntting-top' target='_blank' rel='noreferrer'>
              <svg height='32' aria-hidden='true' viewBox='0 0 16 16' version='1.1' width='32' data-view-component='true'>
                <path fill='#ffffff' fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              <span className='text'>@ntting-top</span>
            </a>
            <a className='github' href='https://github.com/ntting-top' target='_blank' rel='noreferrer'>
              <svg height='32' width='32' aria-hidden='true' t="1728113262172" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1229">
                <path d="M1003.988341 920.409302c0 47.254822-38.308713 85.563535-85.563535 85.563535H105.575194c-47.254822 0-85.563535-38.308713-85.563535-85.563535s38.308713-85.563535 85.563535-85.563535h812.849612c47.254822 0 85.563535 38.308713 85.563535 85.563535z" fill="#A5A5A5" p-id="1230"></path><path d="M939.817674 321.464558v470.595473c0 47.254822-38.308713 85.571473-85.571472 85.571473h-684.492404c-47.26276 0-85.571473-38.316651-85.571472-85.571473V321.464558c0-47.254822 38.308713-85.563535 85.571472-85.563535h684.492404c47.26276 0 85.571473 38.308713 85.571472 85.571473z" fill="#CCCAC4" p-id="1231"></path><path d="M854.25414 834.845767H169.74586a42.785736 42.785736 0 0 1-42.785736-42.785736V321.464558a42.785736 42.785736 0 0 1 42.785736-42.785736h684.50828a42.785736 42.785736 0 0 1 42.785736 42.785736v470.595473a42.785736 42.785736 0 0 1-42.785736 42.785736z" fill="#F2EFE2" p-id="1232"></path><path d="M800.775938 412.378295H223.224062a32.085333 32.085333 0 0 1 0-64.170667h577.551876a32.085333 32.085333 0 0 1 0 64.170667zM490.607132 492.591628a32.085333 32.085333 0 0 0-32.085334-32.085333H223.224062a32.085333 32.085333 0 0 0 0 64.170666h235.297736a32.085333 32.085333 0 0 0 32.085334-32.085333z m342.254139 0a32.085333 32.085333 0 0 0-32.085333-32.085333H565.478202a32.085333 32.085333 0 0 0 0 64.170666h235.297736a32.085333 32.085333 0 0 0 32.085333-32.085333z" fill="#BFBBA3" p-id="1233"></path><path d="M800.775938 759.982636H223.224062a32.085333 32.085333 0 0 1-32.085333-32.085334V599.548031a32.085333 32.085333 0 0 1 32.085333-32.085333h577.551876a32.085333 32.085333 0 0 1 32.085333 32.085333v128.349271a32.085333 32.085333 0 0 1-32.085333 32.085334z" fill="#FFD880" p-id="1234"></path><path d="M288.466357 741.201364l-4.477024 4.484962 0.15876 0.158759-36.697302 36.705241a14.050233 14.050233 0 0 1-19.860838 0l-36.697302-36.705241 0.15876-0.158759-4.477023-4.484962a32.863256 32.863256 0 1 1 46.468961-46.468961l4.477023 4.484961 4.477023-4.484961a32.863256 32.863256 0 1 1 46.468962 46.468961z" fill="#FC8059" p-id="1235"></path><path d="M743.019163 583.862574l-42.785737 57.042356a21.392868 21.392868 0 0 1-34.212713 0l-42.785736-57.042356a21.392868 21.392868 0 0 1-4.286512-12.835721V64.773953a42.785736 42.785736 0 0 1 42.785737-42.777798h42.785736a42.785736 42.785736 0 0 1 42.785736 42.785736v506.244962c-0.007938 4.627845-1.508217 9.128682-4.286511 12.835721z" fill="#D6A154" p-id="1236"></path><path d="M731.25507 599.548031l-31.013706 41.356899a21.392868 21.392868 0 0 1-34.228589 0l-31.013705-41.356899h96.256z" fill="#B26932" p-id="1237"></path><path d="M618.956403 513.984496V64.773953a42.785736 42.785736 0 0 1 42.785737-42.777798h42.777798a42.785736 42.785736 0 0 1 42.785736 42.785736V513.984496h-128.357209z" fill="#FFD880" p-id="1238"></path><path d="M683.12707 513.984496V21.996155h21.392868a42.785736 42.785736 0 0 1 42.785736 42.785736V513.984496h-64.178604z" fill="#FCC159" p-id="1239"></path><path d="M747.297736 64.773953v42.785737H618.956403V64.773953a42.785736 42.785736 0 0 1 42.777799-42.777798h42.785736a42.785736 42.785736 0 0 1 42.777798 42.785736z" fill="#FC8059" p-id="1240"></path><path d="M950.708589 824.042171c3.341891-10.057426 5.151752-20.813395 5.151752-31.974202V321.464558c0-56.018357-45.579907-101.606202-101.606201-101.606201H763.340403V64.773953c0-32.426667-26.38586-58.820465-58.820465-58.820465h-42.785736c-32.434605 0-58.820465 26.393798-58.820466 58.820465v155.084404H169.737922c-56.026295 0-101.606202 45.587845-101.606201 101.606201v470.595473c0 11.168744 1.80986 21.916775 5.15969 31.974202A101.49507 101.49507 0 0 0 3.968992 920.409302c0 56.026295 45.579907 101.606202 101.606202 101.606202h812.849612c56.026295 0 101.606202-45.579907 101.606202-101.606202a101.487132 101.487132 0 0 0-69.322419-96.367131zM634.99907 64.773953a26.766884 26.766884 0 0 1 26.735132-26.735131h42.785736a26.766884 26.766884 0 0 1 26.735132 26.743069v26.735132H634.99907V64.773953z m96.256 58.828404v374.339472h-32.085334V123.602357h32.085334z m-96.256 0h32.085333v374.339472h-32.085333V123.602357z m0 406.424806H731.247132v40.99969a5.397829 5.397829 0 0 1-1.071628 3.206945l-42.785737 57.042357a5.247008 5.247008 0 0 1-4.270635 2.143256 5.247008 5.247008 0 0 1-4.286512-2.143256l-42.777798-57.034419a5.397829 5.397829 0 0 1-1.071628-3.214883v-40.99969zM100.224992 321.464558c0-38.332527 31.188341-69.520868 69.520868-69.520868h433.167876v319.083163c0 8.041178 2.651287 16.010915 7.48552 22.464496l42.785736 57.034418a37.110078 37.110078 0 0 0 29.942078 14.971039 37.118016 37.118016 0 0 0 29.950015-14.971039l42.785737-57.034418a37.665736 37.665736 0 0 0 7.485519-22.464496V251.94369h90.913737c38.332527 0 69.51293 31.196279 69.51293 69.528806v470.595473c0 38.332527-31.180403 69.520868-69.51293 69.520868H169.737922c-38.332527 0-69.520868-31.188341-69.520868-69.520868V321.464558zM918.424806 989.930171H105.575194c-38.340465 0-69.520868-31.188341-69.520868-69.520869a69.401798 69.401798 0 0 1 52.446263-67.393488c18.55107 24.671256 48.064496 40.658357 81.245271 40.658357h684.50828c33.180775 0 62.694202-15.987101 81.253209-40.666295a69.409736 69.409736 0 0 1 52.438325 67.401426c0 38.340465-31.188341 69.520868-69.520868 69.520869z m-572.201674-48.128a16.034729 16.034729 0 0 1-16.042667 16.034728H159.053395a16.034729 16.034729 0 1 1 0-32.077395h171.12707a16.034729 16.034729 0 0 1 16.034729 16.034729z m534.766139 0a16.034729 16.034729 0 0 1-16.034728 16.034728H544.077395a16.034729 16.034729 0 1 1 0-32.077395h320.861272a16.034729 16.034729 0 0 1 16.042666 16.034729z m-393.589085 0a16.034729 16.034729 0 0 1-16.042667 16.034728h-2.143255a16.034729 16.034729 0 1 1 0-32.077395h2.143255a16.034729 16.034729 0 0 1 16.042667 16.034729z m-66.313922 0a16.034729 16.034729 0 0 1-16.034729 16.034728h-2.143256a16.034729 16.034729 0 1 1 0-32.077395h2.143256a16.034729 16.034729 0 0 1 16.034729 16.034729z" fill="#4C4C4C" p-id="1241">
                </path>
              </svg>
              <span className='text'>blog</span>
            </a>
            <a className='github' href='https://github.com/ntting-top' target='_blank' rel='noreferrer'>
              <svg t="1728113414548" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1386" width="30" height=""><path d="M746.24 824.064c-170.922667 0.042667-275.712 0-314.368-0.170667a18.176 18.176 0 0 0-15.445333 6.912c-23.978667 27.562667-58.154667 66.56-102.570667 116.992a42.666667 42.666667 0 0 1-71.125333-11.093333 16668.16 16668.16 0 0 1-45.824-105.557333c-2.474667-5.802667-5.461333-7.253333-11.434667-7.253334-14.378667 0.170667-33.536 0.213333-57.472 0.213334a42.666667 42.666667 0 0 1-42.666667-42.666667V329.6a42.666667 42.666667 0 0 1 42.666667-42.666667h618.24a42.666667 42.666667 0 0 1 42.666667 42.666667v451.797333a42.666667 42.666667 0 0 1-42.666667 42.666667z m-35.029333-76.757333V363.818667L170.24 364.074667v383.445333l42.112-0.256c16.469333 0 25.898667 0.682667 28.202667 2.005333 2.261333 1.493333 15.786667 33.706667 40.533333 96.682667a8.533333 8.533333 0 0 0 14.336 2.474667c37.845333-42.965333 65.706667-74.453333 83.541333-94.464 1.962667-2.218667 6.229333-4.394667 12.757334-6.442667l319.445333-0.213333zM341.333333 512h195.968a42.666667 42.666667 0 1 1 0 85.333333H341.333333a42.666667 42.666667 0 0 1 0-85.333333z m554.666667 159.786667h-48.042667a21.333333 21.333333 0 0 1-21.333333-21.333334v-33.578666a21.333333 21.333333 0 0 1 21.333333-21.333334h12.970667V206.250667H355.328v16.469333a21.333333 21.333333 0 0 1-21.333333 21.333333h-34.133334a21.333333 21.333333 0 0 1-21.333333-21.333333V170.837333a42.666667 42.666667 0 0 1 42.666667-42.666666H896a42.666667 42.666667 0 0 1 42.666667 42.666666v458.282667a42.666667 42.666667 0 0 1-42.666667 42.666667z" fill="#000000" p-id="1387">
                </path>
              </svg>
              <span className='text'>联系我</span>
            </a>
            <a className='github' href='https://github.com/ntting-top' target='_blank' rel='noreferrer'>
            <svg t="1728113522212" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1532" width="30" height="30"><path d="M510.0032 492.9536c-12.16 0-24.3456-2.3808-35.9424-7.1168L71.7824 300.5952c-11.3408-4.6336-18.816-15.5648-19.072-27.8016s6.784-23.4496 17.92-28.544l400.1536-183.296a100.1728 100.1728 0 0 1 82.7648-0.3072l398.1056 178.8416c11.1616 5.0176 18.2784 16.1792 18.1248 28.416s-7.5776 23.2192-18.8672 27.9296l-404.3264 189.7216a94.26944 94.26944 0 0 1-36.5824 7.3984zM160.64 270.592l336.7424 158.3872a33.0496 33.0496 0 0 0 25.5232-0.1024l338.9952-162.3808-333.5424-149.8112a38.6688 38.6688 0 0 0-32 0.128L160.64 270.592z" fill="#040000" p-id="1533"></path><path d="M510.1568 722.7648c-14.4896 0-28.9536-3.3536-42.1632-10.0864L68.3264 509.0816c-8.576-4.3776-15.0784-12.2624-16.9472-21.6832a30.7072 30.7072 0 0 1 15.0272-32.8192l189.6704-106.9568c19.5584-11.0336 44.3136-4.1216 55.3472 15.4368l10.2144 18.1248-175.1808 98.7904L495.872 657.92a31.5392 31.5392 0 0 0 28.672-0.0512l354.0224-181.9136-175.9488-100.736 10.3424-18.0736c11.1616-19.4816 35.968-26.2144 55.4496-15.0784l189.7984 108.672c9.7792 5.6064 15.6928 16.1024 15.4368 27.3664s-6.656 21.4784-16.6656 26.624l-404.352 207.7696a92.53376 92.53376 0 0 1-42.4704 10.2656z" fill="#040000" p-id="1534"></path><path d="M512.2048 975.9744c-4.7872 0-9.5744-1.1264-13.952-3.3536L70.2464 754.5856c-8.576-4.3776-15.0784-12.2624-16.9472-21.7088a30.72512 30.72512 0 0 1 15.0272-32.8192l192.1536-108.3648c18.176-10.24 41.2416-3.8144 51.4816 14.3616l11.6224 20.608-175.1808 98.7904 363.7504 185.2928 368.3584-189.2608-175.9488-100.736 11.7504-20.5312c10.368-18.1248 33.4592-24.3968 51.584-14.0288l192.2816 110.08c9.7792 5.6064 15.6928 16.1024 15.4368 27.3664a30.72 30.72 0 0 1-16.6656 26.624l-432.6656 222.3104a31.0272 31.0272 0 0 1-14.08 3.4048z" fill="#040000" p-id="1535"></path></svg>
              <span className='text'>项目总结</span>
            </a>
          </div>
          <div className='personal'>
            <div className='personal_intro'>
              <p>Hello, I am Tingting Niu, gradually becoming a heavy enthusiast of life and technology.</p> 
              <p>📫Graduated in 2024 and currently work at Meituan, focusing on cross-platform and native development.</p>
              <p>🌱I hope that through my work, I can bring more joy and happiness to people in some small corner of the world.</p>
              <p>👯Whether as a leader or a collaborator, I will strive to be the best partner.</p>
              <p>😄Finally, a quote for myself: Cultivate yourself into a lifelong learner through extensive reading; foster curiosity and strive to become a little smarter every day.</p>
            </div>
            <hr className='hrLine'></hr>
            <div className='personal_intro'>
              <p>你好，我是牛婷婷👋，正在逐渐变成生活、技术的重度爱好者</p>
              <p>📫2024年毕业，目前就职于美团，专注于跨端开发及原生开发。</p>
              <p>🌱我希望通过我的工作在世界的某个小角落为人们带来更多的快乐和幸福</p>
              <p>👯无论是作为主导者还是合作者，我都将努力成为最优质的伙伴。👇👇👇</p>
              <p>💬WeChat：15698606299，Welcome to communicate!</p>
              <p>😄个签：通过广泛的阅读把自己培养成一个终生自学者，培养好奇心，每天努力使自己聪明一点点</p>
            </div>
          </div>
        </div>
        <audio id="backgroundMusic" src="http://m704.music.126.net/20241005002601/2f377cb09bb2359d3655a43b56049301/jdyyaac/obj/w5rDlsOJwrLDjj7CmsOj/44173654022/2d68/54db/65fc/531e414544e5c399d29b55080c96aafa.m4a?authSecret=00000192584356d209480a3b195984d3" autoPlay loop></audio>
     </div>
    )
  }
}