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
