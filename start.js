module.exports = async (kernel) => {
  let port = await kernel.port()
  return {
    requires: {
      bundle: "ai",
    },
    daemon: true,
    run: [
      {
        method: "shell.run",
        params: {
          venv: "env",
          env: {
            CUDA_HOME: "/opt/cuda",
            CUDA_PATH: "/opt/cuda",
            LD_LIBRARY_PATH: "/opt/cuda/targets/x86_64-linux/lib:/opt/cuda/lib64:/opt/cuda/lib:$LD_LIBRARY_PATH",
            SERVER_NAME: "127.0.0.1",
            SERVER_PORT: port
          },
          path: "app",
          message: [
            "python wgp.py --multiple-images {{args.compile ? '--compile' : ''}} {{args.safe ? '--attention sdpa' : ''}} || {{args.safe ? 'exit 1' : 'python wgp.py --multiple-images --attention sdpa'}}"
          ],
          on: [{
            "event": "/http:\/\/[0-9.:]+/",   
            "done": true
          }]
        }
      },
      {
        method: "local.set",
        params: {
          url: "{{input.event[0]}}"
        }
      }
    ]
  }
}
