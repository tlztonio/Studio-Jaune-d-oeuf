#include <begin_vertex>
// transformed.xy += sin(transformed.x*5.0+ uMouse.x) * 0.1;
transformed.xyz += clamp(distance(position.xyz,uMouse.xyz), -5.0 , 1.0)*0.25 ;
transformed.xyz += sin(transformed.z *6.0 + uTime) * 0.017;

// DELAY MOUSE MOVE AND SINUS DEFORMATION STAYS 
// tweak sinus general deformation & TRY MAP THING LIKE YURI TO MAKE A SMOOTHER CIRCLE



