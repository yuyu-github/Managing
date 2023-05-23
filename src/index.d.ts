declare module 'google-charts-node' {
  type RenderOptions = {
    width?: string,
    height?: string,
    packages?: string[],
    mapsApiKey?: string,
    puppeteerOptions?: any
  }

  function render(drawChartFunction: string | Function, options: RenderOptions): Promise<Buffer>
}
