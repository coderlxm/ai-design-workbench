import { defineStore } from 'pinia'

import type { ImageAsset } from '@/types/workflow'

export const useAssetStore = defineStore('assets', {
  state: () => ({
    sceneLibrary: [] as ImageAsset[],
    modelLibrary: [] as ImageAsset[],
    selectedSceneAsset: null as ImageAsset | null,
    croppedSceneAsset: null as ImageAsset | null,
    selectedModelSet: [] as ImageAsset[],
  }),
  getters: {
    sceneAssetForPreview: state => state.croppedSceneAsset ?? state.selectedSceneAsset,
    selectedModelReference: state => state.selectedModelSet[0] ?? null,
    hasModelReference: state => state.selectedModelSet.length > 0,
  },
  actions: {
    setSceneLibrary(assets: ImageAsset[]) {
      this.sceneLibrary = assets.filter(asset => asset.kind === 'scene')
    },
    setModelLibrary(assets: ImageAsset[]) {
      this.modelLibrary = assets.filter(asset => asset.kind === 'model')
    },
    selectScene(asset: ImageAsset) {
      this.selectedSceneAsset = asset
      this.croppedSceneAsset = null
    },
    setCroppedScene(asset: ImageAsset | null) {
      this.croppedSceneAsset = asset
    },
    setModelReference(asset: ImageAsset) {
      this.selectedModelSet = [asset]
    },
    clearModelViews() {
      this.selectedModelSet = []
    },
  },
})
