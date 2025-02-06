import postcssPresetEnv from 'postcss-preset-env'
import cssnano from 'cssnano'
import oldie from 'oldie'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

export default {
  plugins: [
      cssnano({
        preset: "default" ,
        discardComments: { removeAll: true }

    }),
      postcssPresetEnv({ stage:1 }),
      oldie(),
      autoprefixer(),
      tailwindcss()

  ],
}