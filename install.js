module.exports = {
  requires: {
    bundle: "ai"
  },
  run: [
    {
      when: "{{gpu === 'amd' || platform === 'darwin'}}",
      method: "notify",
      params: {
        html: "This app requires an NVIDIA GPU. Not compatible with AMD GPUs and macOS."
      },
      next: null
    },
    {
      method: "shell.run",
      params: {
        message: [
          "git clone https://github.com/deepbeepmeep/Wan2GP app",
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: [
          "{{platform === 'linux' ? 'if [ -x env/bin/python ]; then env/bin/python -c \"import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 11) else 1)\" || (echo \"Existing env is not Python 3.11. Run Reset or delete app/env to continue.\" && exit 1); else uv venv --python 3.11 env; fi' : 'uv venv env'}}",
          "env/bin/python -c \"import sys; print('env python:', sys.version)\""
        ]
      }
    },
    {
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
          "uv pip install --upgrade pip setuptools wheel",
          "uv pip install hf-xet"
        ]
      }
    },
    {
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
    },
    {
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
    },
    {
      method: 'input',
      params: {
        title: 'Installation completed',
        description: 'Click "Start" to get started'
      }
    }
  ]
}
