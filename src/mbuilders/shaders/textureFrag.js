export default `
uniform sampler2D satTexture;
			
varying vec2 vUV;

void main() 
{	
	gl_FragColor = texture2D( satTexture, vUV );
}
`;