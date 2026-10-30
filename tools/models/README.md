# AI-generated PC parts

The six realistic parts in the hero render were generated with Higgsfield on 2026-10-30:
a reference image with `gpt_image_2_5`, then a textured 3D model with `tripo_h3_1_image_to_3d`
(texture and PBR on, detailed textures, 60,000 face limit, 12 credits each).

The `.glb` files are about 10 MB each, so they are kept out of git. They are only needed to re-render the hero frames
(`node tools/render-frames.mjs`); the live site uses the rendered WebP frames in `assets/pc/`.
If they are missing, `tools/pc3d.js` falls back to the hand-built parts.

| File | Part | Image job | 3D job |
|---|---|---|---|
| `gpu.glb` | Graphics card | `cb192ec5-a487-4a96-b1c2-9555cd27ff48` | `a44cbb70-1a44-45d1-8e98-60c4285dfb2d` |
| `psu.glb` | Power supply | `e074532b-38b1-4c99-895e-2ac8c3b60efb` | `e0f15866-48bb-42f6-bbae-57c2c8f16088` |
| `cooler.glb` | CPU cooler | `0a2d3560-190b-4b3d-acb7-bbfc0ca74132` | `d4ba1cc7-3e13-482d-ba92-273ef80e6903` |
| `ram.glb` | Memory stick | `3494b489-813c-4088-a718-28168cfdb9fa` | `6c878eb0-0431-4f3a-a1c9-a5a29bf4e589` |
| `board.glb` | Motherboard | `ed6efec9-cc8f-41d7-9d17-7c248115bd80` | `d40749a9-7aa4-40aa-874c-92da4648cc4c` |
| `fan.glb` | Case fan | `616cf01d-bc6e-4255-9f14-74a5a3f7acdf` | `d28e0ddd-627e-417c-b9ea-be457ec2894e` |

To get the files again, open the 3D jobs in your Higgsfield history and download the GLBs into this folder with these names.
The case panels, glass, CPU and M.2 drive are still built in code (they need to come apart separately or are tiny).
