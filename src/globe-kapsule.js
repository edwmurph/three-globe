import {
  Group,
  Vector2,
  Vector3
} from 'three';

const THREE = window.THREE
  ? window.THREE // Prefer consumption from global THREE, if exists
  : {
    Group,
    Vector2,
    Vector3
  };

import Kapsule from 'kapsule';
import TWEEN from '@tweenjs/tween.js';

import { emptyObject } from './utils/gc';
import linkKapsule from './utils/kapsule-link.js';
import { polar2Cartesian, cartesian2Polar } from './utils/coordTranslate';

import GlobeLayerKapsule from './layers/globe';
import PointsLayerKapsule from './layers/points';
import ArcsLayerKapsule from './layers/arcs';
import HexBinLayerKapsule from './layers/hexbin';
import PolygonsLayerKapsule from './layers/polygons';
import HexedPolygonsLayerKapsule from './layers/hexedPolygons';
import PathsLayerKapsule from './layers/paths';
import LabelsLayerKapsule from './layers/labels';
import CustomLayerKapsule from './layers/custom';

//

// Expose config from layers
const bindGlobeLayer = linkKapsule('globeLayer', GlobeLayerKapsule);
const linkedGlobeLayerProps = Object.assign(...[
  'globeImageUrl',
  'bumpImageUrl',
  'showAtmosphere',
  'showGraticules'
].map(p => ({ [p]: bindGlobeLayer.linkProp(p)})));

const bindPointsLayer = linkKapsule('pointsLayer', PointsLayerKapsule);
const linkedPointsLayerProps = Object.assign(...[
  'pointsData',
  'pointLat',
  'pointLng',
  'pointColor',
  'pointAltitude',
  'pointRadius',
  'pointResolution',
  'pointsMerge',
  'pointsTransitionDuration'
].map(p => ({ [p]: bindPointsLayer.linkProp(p)})));

const bindArcsLayer = linkKapsule('arcsLayer', ArcsLayerKapsule);
const linkedArcsLayerProps = Object.assign(...[
  'arcsData',
  'arcStartLat',
  'arcStartLng',
  'arcEndLat',
  'arcEndLng',
  'arcColor',
  'arcAltitude',
  'arcAltitudeAutoScale',
  'arcStroke',
  'arcCurveResolution',
  'arcCircularResolution',
  'arcDashLength',
  'arcDashGap',
  'arcDashInitialGap',
  'arcDashAnimateTime',
  'arcsTransitionDuration'
].map(p => ({ [p]: bindArcsLayer.linkProp(p)})));

const bindHexBinLayer = linkKapsule('hexBinLayer', HexBinLayerKapsule);
const linkedHexBinLayerProps = Object.assign(...[
  'hexBinPointsData',
  'hexBinPointLat',
  'hexBinPointLng',
  'hexBinPointWeight',
  'hexBinResolution',
  'hexMargin',
  'hexTopColor',
  'hexSideColor',
  'hexAltitude',
  'hexBinMerge',
  'hexTransitionDuration'
].map(p => ({ [p]: bindHexBinLayer.linkProp(p)})));

const bindHexedPolygonsLayer = linkKapsule('hexedPolygonsLayer', HexedPolygonsLayerKapsule);
const linkedHexedPolygonsLayerProps = Object.assign(...[
  'hexPolygonsData',
  'hexPolygonGeoJsonGeometry',
  'hexPolygonColor',
  'hexPolygonAltitude',
  'hexPolygonResolution',
  'hexPolygonMargin',
  'hexPolygonsTransitionDuration'
].map(p => ({ [p]: bindHexedPolygonsLayer.linkProp(p)})));

const bindPolygonsLayer = linkKapsule('polygonsLayer', PolygonsLayerKapsule);
const linkedPolygonsLayerProps = Object.assign(...[
  'polygonsData',
  'polygonGeoJsonGeometry',
  'polygonCapColor',
  'polygonSideColor',
  'polygonStrokeColor',
  'polygonAltitude',
  'polygonsTransitionDuration'
].map(p => ({ [p]: bindPolygonsLayer.linkProp(p)})));

const bindPathsLayer = linkKapsule('pathsLayer', PathsLayerKapsule);
const linkedPathsLayerProps = Object.assign(...[
  'pathsData',
  'pathPoints',
  'pathPointLat',
  'pathPointLng',
  'pathPointAlt',
  'pathResolution',
  'pathColor',
  'pathStroke',
  'pathDashLength',
  'pathDashGap',
  'pathDashInitialGap',
  'pathDashAnimateTime',
  'pathTransitionDuration'
].map(p => ({ [p]: bindPathsLayer.linkProp(p)})));

const bindLabelsLayer = linkKapsule('labelsLayer', LabelsLayerKapsule);
const linkedLabelsLayerProps = Object.assign(...[
  'labelsData',
  'labelLat',
  'labelLng',
  'labelAltitude',
  'labelRotation',
  'labelText',
  'labelSize',
  'labelTypeFace',
  'labelColor',
  'labelResolution',
  'labelIncludeDot',
  'labelDotRadius',
  'labelDotOrientation',
  'labelsTransitionDuration'
].map(p => ({ [p]: bindLabelsLayer.linkProp(p)})));

const bindCustomLayer = linkKapsule('customLayer', CustomLayerKapsule);
const linkedCustomLayerProps = Object.assign(...[
  'customLayerData',
  'customThreeObject',
  'customThreeObjectUpdate'
].map(p => ({ [p]: bindCustomLayer.linkProp(p)})));

//

export default Kapsule({
  props: {
    rendererSize: {
      default: new THREE.Vector2(window.innerWidth, window.innerHeight),
      onChange(rendererSize, state) {
        state.pathsLayer.rendererSize(rendererSize);
      },
      triggerUpdate: false
    },
    ...linkedGlobeLayerProps,
    ...linkedPointsLayerProps,
    ...linkedArcsLayerProps,
    ...linkedHexBinLayerProps,
    ...linkedPolygonsLayerProps,
    ...linkedHexedPolygonsLayerProps,
    ...linkedPathsLayerProps,
    ...linkedLabelsLayerProps,
    ...linkedCustomLayerProps
  },

  methods: {
    getCoords: (state, ...args) => polar2Cartesian(...args),
    toGeoCoords: (state, ...args) => cartesian2Polar(...args)
  },

  stateInit: () => {
    return {
      globeLayer: GlobeLayerKapsule(),
      pointsLayer: PointsLayerKapsule(),
      arcsLayer: ArcsLayerKapsule(),
      hexBinLayer: HexBinLayerKapsule(),
      polygonsLayer: PolygonsLayerKapsule(),
      hexedPolygonsLayer: HexedPolygonsLayerKapsule(),
      pathsLayer: PathsLayerKapsule(),
      labelsLayer: LabelsLayerKapsule(),
      customLayer: CustomLayerKapsule(),
      animateIn: false
    }
  },

  init(threeObj, state, { animateIn = true }) {
    // Clear the scene
    emptyObject(threeObj);

    // Main three object to manipulate
    threeObj.add(state.scene = new THREE.Group());

    // add globe layer group
    const globeG = new THREE.Group();
    state.scene.add(globeG);
    state.globeLayer(globeG);

    // add points layer group
    const pointsG = new THREE.Group();
    state.scene.add(pointsG);
    state.pointsLayer(pointsG);

    // add arcs layer group
    const arcsG = new THREE.Group();
    state.scene.add(arcsG);
    state.arcsLayer(arcsG);

    // add hexbin layer group
    const hexBinG = new THREE.Group();
    state.scene.add(hexBinG);
    state.hexBinLayer(hexBinG);

    // add polygons layer group
    const polygonsG = new THREE.Group();
    state.scene.add(polygonsG);
    state.polygonsLayer(polygonsG);

    // add hexed polygons layer group
    const hexedPolygonsG = new THREE.Group();
    state.scene.add(hexedPolygonsG);
    state.hexedPolygonsLayer(hexedPolygonsG);

    // add paths layer group
    const pathsG = new THREE.Group();
    state.scene.add(pathsG);
    state.pathsLayer(pathsG);

    // add labels layer group
    const labelsG = new THREE.Group();
    state.scene.add(labelsG);
    state.labelsLayer(labelsG);

    // add custom layer group
    const customG = new THREE.Group();
    state.scene.add(customG);
    state.customLayer(customG);

    // animate build in, one time only
    state.animateIn = animateIn;
    if (animateIn) {
      state.scene.visible = false; // hide before animation
    }

    state.globeLayer.onGlobeReady(() => {
      state.scene.visible = true;

      if (!state.animateIn) {
        return;
      }

      // Animate build-in just once
      state.animateIn = false;
      state.scene.scale.set(1e-6, 1e-6, 1e-6)

      setTimeout(() => {
        new TWEEN.Tween({k: 1e-6})
          .to({k: 1}, 600)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(({ k }) => { console.log(k); state.scene.scale.set(k, k, k); })
          .start();

        const rotAxis = new THREE.Vector3(0, 1, 0);
        new TWEEN.Tween({rot: Math.PI * 2})
          .to({rot: 0}, 1200)
          .easing(TWEEN.Easing.Quintic.Out)
          .onUpdate(({ rot }) => state.scene.setRotationFromAxisAngle(rotAxis, rot))
          .start();
      }, 600)
    });

    // run tween updates
    (function onFrame() {
      requestAnimationFrame(onFrame);
      TWEEN.update();
    })(); // IIFE
  }
});
