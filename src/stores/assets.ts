import { defineStore } from 'pinia'

import type { ImageAsset, ModelViewAsset } from '@/types/workflow'

export const useAssetStore = defineStore('assets', {
  state: () => ({
    sceneLibrary: [] as ImageAsset[],
    modelLibrary: [] as ModelViewAsset[],
    selectedSceneAsset: null as ImageAsset | null,
    croppedSceneAsset: null as ImageAsset | null,
    selectedModelSet: [] as ModelViewAsset[],
    usageRightsConfirmed: false,
  }),
  getters: {
    sceneAssetForPreview: state => state.croppedSceneAsset ?? state.selectedSceneAsset,
    selectedModelViews: state => state.selectedModelSet,
    missingModelViewTags: state => ['front', 'left', 'right'].filter(tag => !state.selectedModelSet.some(view => view.viewTag === tag)),
    hasEnoughModelViews: state => ['front', 'left', 'right'].every(tag => state.selectedModelSet.some(view => view.viewTag === tag)),
  },
  actions: {
    setSceneLibrary(assets: ImageAsset[]) {
      this.sceneLibrary = assets.filter(asset => asset.kind === 'scene')
    },
    setModelLibrary(assets: ModelViewAsset[]) {
      this.modelLibrary = assets
    },
    selectScene(asset: ImageAsset) {
      this.selectedSceneAsset = asset
      this.croppedSceneAsset = null
    },
    setCroppedScene(asset: ImageAsset | null) {
      this.croppedSceneAsset = asset
    },
    addOrReplaceModelView(asset: ModelViewAsset) {
      const index = this.selectedModelSet.findIndex(view => view.viewTag === asset.viewTag)
      if (index >= 0)
        this.selectedModelSet.splice(index, 1, asset)
      else
        this.selectedModelSet.push(asset)
    },
    removeModelView(viewTag: ModelViewAsset['viewTag']) {
      this.selectedModelSet = this.selectedModelSet.filter(view => view.viewTag !== viewTag)
    },
    clearModelViews() {
      this.selectedModelSet = []
    },
    setUsageRightsConfirmed(value: boolean) {
      this.usageRightsConfirmed = value
    },
  },
})
