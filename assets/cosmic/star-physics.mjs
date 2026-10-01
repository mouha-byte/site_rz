export const clamp = (v, lo=0, hi=1) => Math.max(lo,Math.min(hi,v));
export const smooth = v => { v=clamp(v); return v*v*(3-2*v); };
export const ease = (speed,dt) => 1-Math.exp(-speed*dt);

// Pointer disturbance fades even when the pointer remains above the logo.
export function activity(lastMove,now,active) {
  return active ? 1-smooth((now-lastMove-.12)/.6) : 0;
}

// Stable damped spring, independent of the display's refresh rate.
export function spring(state,targetX,targetY,dt) {
  const count=Math.max(1,Math.ceil(dt*120));
  const step=dt/count,damping=Math.exp(-10*step);
  for(let i=0;i<count;i++) {
    state.vx+=(targetX-state.dx)*34*step;
    state.vy+=(targetY-state.dy)*34*step;
    state.vx*=damping;state.vy*=damping;
    state.dx+=state.vx*step;state.dy+=state.vy*step;
  }
}

export function rotate(x,y,z,yaw,pitch) {
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const rx=x*cy+z*sy,rz=z*cy-x*sy;
  return [rx,y*cp-rz*sp,y*sp+rz*cp];
}

export function project(x,y,z,camera,unit,cx,cy) {
  const distance=camera-z;
  if(distance<.06)return null;
  const depth=3/distance;
  return {x:cx+x*unit*depth,y:cy+y*unit*depth,depth};
}
