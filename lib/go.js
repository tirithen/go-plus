'use babel'

let goVersion
export function version (goconfig) {
  if (goVersion) {
    return Promise.resolve(goVersion)
  }
  return goconfig.locator.findTool('go').then((go) => {
    const args = ['version']
    return goconfig.executor.exec(go, args, 'project').then((r) => {
      if (r.exitcode !== 0) {
        console.log('go-plus: Failed to get "go version":', (r.stderr.trim()) || `exitcode ${r.exitcode}`)
        return null
      }
      const raw = r.stdout.trim()
      const matches = raw.match(/^go version go(\d)\.(\d+)/)
      goVersion = {
        raw,
        major: parseInt(matches[1], 10),
        minor: parseInt(matches[2], 10)
      }
      return goVersion
    })
  })
}

let vendorSupported
export function isVendorSupported (goconfig) {
  if (vendorSupported != null) {
    return Promise.resolve(vendorSupported)
  }
  return version(goconfig).then(version => {
    if (!version) {
      return goconfig.environment()['GO15VENDOREXPERIMENT'] !== '0'
    }

    switch (version.major) {
      case 0:
        vendorSupported = false
        break
      case 1:
        vendorSupported = (version.minor > 6 || ((version.minor === 5 || version.minor === 6) && goconfig.environment()['GO15VENDOREXPERIMENT'] !== '0'))
        break
      default:
        vendorSupported = true
        break
    }
    return vendorSupported
  })
}

let pkgs
export function allPackages (goconfig) {
  if (pkgs) {
    return pkgs
  }
  // only do this once because getting *ALL* packages is quite an effort
  pkgs = new Map()

  goconfig.locator.findTool('go').then((go) => {
    const args = ['list', '-f', '{{.Name}};{{.Standard}};{{.ImportPath}}', 'all']
    const options = goconfig.executor.getOptions('project')
    options.timeout = -1 // no timeout, "go list all" takes some time!
    return goconfig.executor.exec(go, args, options).then((r) => {
      if (r.exitcode !== 0) {
        console.log('go-plus: "go list all" returned the following errors:', r.stderr.trim() || `exitcode ${r.exitcode}`)
      }

      r.stdout.trim()
        .split('\n')
        .map((v) => v.split(';'))
        .forEach(([name, isStandard, path]) => {
          if (isStandard === 'true') {
            // std libs are already handled by gocode (because of the "unimported-packages" flag)
            return
          }
          const p = pkgs.get(name) || []
          pkgs.set(name, p.concat(path.trim()))
        })

      pkgs.forEach((p) => {
        p.sort()
      })
    })
  })
  return pkgs
}
