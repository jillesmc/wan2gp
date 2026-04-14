module.exports = {
  run: [{
    method: "shell.run",
    params: {
      message: "git pull"
    }
  }, {
    method: "shell.run",
    params: {
      path: "app",
      message: "git pull"
    }
  }, {
    method: "script.start",
    params: {
      uri: "torch.js",
      params: {
        venv: "env",
        path: "app",
        triton: "{{!!args.triton}}",
        gguf: "{{platform === 'linux'}}",
        nunchaku: "{{!!args.nunchaku}}",
        lightx2v: "{{!!args.lightx2v}}"
      }
    }
  }, {
    method: "shell.run",
    params: {
      venv: "env",
      path: "app",
      env: {
        CUDA_HOME: "/opt/cuda",
        CUDA_PATH: "/opt/cuda",
        LD_LIBRARY_PATH: "/opt/cuda/targets/x86_64-linux/lib:/opt/cuda/lib64:/opt/cuda/lib:$LD_LIBRARY_PATH"
      },
      message: [
        "uv pip install -r requirements.txt --index-strategy unsafe-best-match",
        "python -c \"import torch; print(torch.__version__, torch.version.cuda, torch.cuda.is_available())\"",
        "{{platform === 'linux' ? 'python -c \"import llamacpp_gguf_cuda; print(\\'gguf kernel ok\\')\"' : 'echo GGUF validation skipped on non-linux'}}"
      ]
    }
  }, {
    when: "{{!!args.safeRuntime}}",
    method: "script.start",
    params: {
      uri: "start.js",
      params: {
        safe: true
      }
    }
  }]
}
