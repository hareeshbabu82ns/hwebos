import Docker from 'dockerode';

const docker = new Docker();

export const ensureUserContainer = async (userId: string) => {
  const containerName = `hmac-shell-${userId}`;
  
  try {
    const container = docker.getContainer(containerName);
    const info = await container.inspect();
    
    if (!info.State.Running) {
      await container.start();
    }
    
    return container;
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Create new container
      // In a real scenario, ensure the image exists or pull it
      const container = await docker.createContainer({
        Image: 'ubuntu:24.04', 
        Cmd: ['/bin/bash'],
        Tty: true,
        OpenStdin: true,
        name: containerName,
        HostConfig: {
          AutoRemove: true, 
        }
      });
      
      await container.start();
      return container;
    }
    throw error;
  }
};
