import { useLoader, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { TextureLoader, EquirectangularReflectionMapping } from 'three';

function SpaceBackground() {
  const { scene } = useThree();
  const texture = useLoader(TextureLoader, '/textures/galaxy_background.png');

  useEffect(() => {
    texture.mapping = EquirectangularReflectionMapping;
    
    scene.background = texture;
  
    scene.environment = texture;

  }, [texture, scene]);

  return null;
}

export default SpaceBackground;