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
    method: "shell.run",
    params: {
      path: "app",
      message: [
        "{{platform === 'linux' ? 'if [ -x env/bin/python ]; then env/bin/python -c \"import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 11) else 1)\" || (echo \"Existing env is not Python 3.11. Run Reset or delete app/env and reinstall.\" && exit 1); else uv venv --python 3.11 env; fi' : 'echo Python 3.11 env check skipped on non-linux'}}",
        "env/bin/python -c \"import sys; print('env python:', sys.version)\""
      ]
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
        "{{platform === 'linux' ? 'python -c \"import sys; assert sys.version_info[:2] == (3, 11), f\\\"Python 3.11 is required for GGUF torch2.10/cu130. Current: {sys.version}\\\"\"' : 'echo Python 3.11 check skipped on non-linux'}}",
        "{{platform === 'linux' ? 'uv pip install https://github.com/deepbeepmeep/kernels/releases/download/GGUF_Kernels/llamacpp_gguf_cuda-1.0.2+torch210cu13py311-cp311-cp311-linux_x86_64.whl' : 'echo GGUF install skipped on non-linux'}}",
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
