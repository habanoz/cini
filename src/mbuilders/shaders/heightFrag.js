export default `
varying float vAmount;

void main() 
{			
	vec4 snow  = smoothstep(0.90, 0.99, vAmount) * vec4(1.0, 1.0, 1.0, 0.0); 
	vec4 rock = ( smoothstep(0.80, 0.95, vAmount) - smoothstep(0.90, 0.96, vAmount) ) * vec4(0.7, 0.5, 0.0, 0.0); 
	vec4 plateu  =  (smoothstep(0.70, 0.90, vAmount)-smoothstep(0.80, 0.90, vAmount)) * vec4(0.4, 0.8, 0.4, 0.0); 
	vec4 forest  =  (smoothstep(0.60, 0.80, vAmount)-smoothstep(0.70, 0.80, vAmount)) * vec4(0.1, 0.90, 0.1, 0.0); 
	vec4 farms  =  (smoothstep(0.50, 0.70, vAmount)-smoothstep(0.60, 0.70, vAmount)) * vec4(0.6, 0.9, 0.0, 0.0); 
	vec4 sand = (smoothstep(0.40, 0.60, vAmount)- smoothstep(0.50, 0.60, vAmount) ) * vec4(0.9, 0.9, 0.1, 0.0);
	
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + sand + farms + forest + plateu + snow + rock;
}
`;